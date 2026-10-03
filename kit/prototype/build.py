from pathlib import Path
b=Path(__file__).parent
out=b/'hush-hard-room.html'
out.write_text((b/'frame.html').read_text()+'\n<script>\n'+(b/'core.js').read_text()+'\n'+(b/'ui.js').read_text()+'\n</script>\n')
print(f'{out} ({out.stat().st_size} bytes)')
