#!/usr/bin/env python3
"""Validate this kit's closed JSON contract. Standard library only.

Supports exactly the JSON Schema keywords used by data/level.schema.json,
not arbitrary draft-2020-12 schemas. Unsupported assertion keywords fail.
"""
import copy
import json
import math
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT/'data/level.schema.json').read_text())
ALLOWED = {'$schema','$id','$defs','$ref','title','description','type','const','enum',
           'minimum','maximum','minLength','pattern','properties','required',
           'additionalProperties','items','minItems','maxItems','oneOf'}

def check(value, schema, path='$'):
    unknown = set(schema)-ALLOWED
    assert not unknown, f'{path}: unsupported schema keywords {unknown}'
    if '$ref' in schema:
        assert schema['$ref'].startswith('#/$defs/')
        return check(value, SCHEMA['$defs'][schema['$ref'].split('/')[-1]], path)
    if 'oneOf' in schema:
        matches=0
        for option in schema['oneOf']:
            try:
                check(value,option,path)
                matches+=1
            except (ValueError,AssertionError):
                pass
        if matches!=1: raise ValueError(f'{path}: expected exactly one valid object type; got {matches}')
        return
    if 'const' in schema and value!=schema['const']:
        raise ValueError(f'{path}: invalid constant')
    if 'const' in schema:
        c=schema['const']
        if isinstance(c,bool) and type(value) is not bool: raise ValueError(f'{path}: expected boolean constant')
        if not isinstance(c,bool) and isinstance(value,bool): raise ValueError(f'{path}: boolean is not numeric constant')
    if 'enum' in schema and value not in schema['enum']: raise ValueError(f'{path}: outside enum')
    typ=schema.get('type')
    ok={'object':lambda:type(value) is dict,'array':lambda:type(value) is list,
        'string':lambda:type(value) is str,'number':lambda:type(value) in (int,float) and math.isfinite(value),
        'integer':lambda:type(value) is int,'boolean':lambda:type(value) is bool}
    if typ and not ok[typ](): raise ValueError(f'{path}: expected {typ}')
    if type(value) in (int,float):
        if not math.isfinite(value): raise ValueError(f'{path}: non-finite number')
        if 'minimum' in schema and value<schema['minimum']: raise ValueError(f'{path}: below minimum')
        if 'maximum' in schema and value>schema['maximum']: raise ValueError(f'{path}: above maximum')
    if isinstance(value,str):
        if len(value)<schema.get('minLength',0): raise ValueError(f'{path}: too short')
        if 'pattern' in schema and not re.search(schema['pattern'],value): raise ValueError(f'{path}: invalid pattern')
    if isinstance(value,dict):
        missing=set(schema.get('required',[]))-set(value)
        if missing: raise ValueError(f'{path}: missing {sorted(missing)}')
        props=schema.get('properties',{})
        if schema.get('additionalProperties') is False and set(value)-set(props):
            raise ValueError(f'{path}: unknown keys {sorted(set(value)-set(props))}')
        for key,child in value.items():
            if key in props: check(child,props[key],f'{path}.{key}')
    if isinstance(value,list):
        if len(value)<schema.get('minItems',0): raise ValueError(f'{path}: too few items')
        if 'maxItems' in schema and len(value)>schema['maxItems']: raise ValueError(f'{path}: too many items')
        if 'items' in schema:
            for i,child in enumerate(value): check(child,schema['items'],f'{path}[{i}]')

def semantic(level):
    width,height=level['world']['width'],level['world']['height']
    def point(p):
        assert 0<=p['x']<=width and 0<=p['y']<=height, 'anchor outside world'
    all_ids=[o['id'] for o in level['objects']]+[e['id'] for e in level['listeners']]
    assert len(all_ids)==len(set(all_ids)), 'duplicate object/listener ID'
    objects={o['id']:o for o in level['objects']}
    listeners={o['id']:o for o in level['listeners']}
    assert level['walker']['listener_id'] in listeners, 'unknown walker listener'
    finish,deadline=level['clock']['finish_seconds'],level['clock']['deadline_seconds']
    assert 0<finish<deadline, 'invalid finish/deadline'
    for e in listeners.values():
        point(e['position'])
        assert e['recovery_floor']<=e['initial_alert']<e['wake_at'], 'listener alert bounds'
    path=level['walker']['path']
    assert path[0]['at_seconds']==0, 'path must start at zero'
    assert path[0]['position']==listeners[level['walker']['listener_id']]['position'], 'path initial position mismatch'
    assert all(a['at_seconds']<b['at_seconds'] for a,b in zip(path,path[1:])), 'path times not strictly increasing'
    assert path[-1]['at_seconds']<=finish, 'walker arrives after earliest finish'
    for p in path: point(p['position'])
    for c in level['cover_windows']:
        assert 0<=c['start_seconds']<c['end_seconds']<=deadline, 'invalid cover interval'
        assert len(c['listener_ids'])==len(set(c['listener_ids'])), 'duplicate cover listener'
        assert set(c['listener_ids'])<=set(listeners), 'unknown cover listener'
    for o in objects.values():
        point(o['position']); p=o['params']
        if 'move_bounds' in p:
            b=p['move_bounds']
            assert 0<=b['min_x']<b['max_x']<=width and 0<=b['min_y']<b['max_y']<=height, 'invalid movement bounds'
            assert b['min_x']<=o['position']['x']<=b['max_x'] and b['min_y']<=o['position']['y']<=b['max_y'], 'initial prop outside movement bounds'
        if o['kind']=='cup':
            point(p['landing'])
            assert p['pre_tip_seconds']>0 and p['fall_seconds']>0, 'cup duration must be positive'
            assert p['trigger_seconds']+p['pre_tip_seconds']+p['fall_seconds']<deadline, 'unheld cup resolves after deadline'
        if o['kind']=='train':
            assert o['position']['x']<p['dock_x']<=width and p['speed']>0, 'invalid track'
            assert o['position']['x']+p['engine_offset_x']<=width, 'engine anchor outside world at start'
        if o['kind']=='window':
            for g in p['gusts']: assert 0<=g['start_seconds']<g['end_seconds']<deadline, 'invalid gust interval'
    for key,kind in [('required_cup_ids','cup'),('required_window_ids','window')]:
        ids=level['completion'][key]
        assert len(ids)==len(set(ids)), 'duplicate completion reference'
        for i in ids: assert i in objects and objects[i]['kind']==kind, 'unknown or wrong-kind completion reference'
    assert level['mastery']['peak_below']<=min(e['wake_at'] for e in listeners.values()), 'mastery threshold above wake threshold'

def validate(level):
    check(level,SCHEMA)
    semantic(level)

def main():
    path=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'data/hard_room_reference.json'
    level=json.loads(path.read_text(),parse_constant=lambda x: (_ for _ in ()).throw(ValueError('non-finite JSON')))
    validate(level)
    # Self-tests demonstrate rejection of meaningful invalid data, not winnability.
    mutations=[
        lambda d:d['objects'][1].update(id=d['objects'][0]['id']),
        lambda d:d['objects'][0]['position'].update(x=-1),
        lambda d:d['clock'].update(deadline_seconds=1),
        lambda d:d['cover_windows'][0].update(listener_ids=['missing']),
        lambda d:d['objects'][3]['params'].update(pre_tip_seconds=0),
        lambda d:d['completion'].update(required_cup_ids=['train']),
        lambda d:d['walker']['path'][1].update(at_seconds=0),
        lambda d:d.update(undeclared=True),
        lambda d:d.update(schema_version=True),
        lambda d:d['objects'][0]['params'].update(scrape_base=-1),
    ]
    baseline=json.loads((ROOT/'data/hard_room_reference.json').read_text())
    for mutate in mutations:
        bad=copy.deepcopy(baseline); mutate(bad)
        try: validate(bad)
        except (AssertionError,ValueError): continue
        raise AssertionError('Invalid fixture was accepted')
    print(f'PASS: {path.name}; schema and semantic checks; {len(mutations)} invalid-data rejection checks. Native implementation and room solvability are not certified by this validator.')

if __name__=='__main__':
    try: main()
    except (AssertionError,ValueError,KeyError) as e:
        print(f'FAIL: {e}',file=sys.stderr);sys.exit(1)
