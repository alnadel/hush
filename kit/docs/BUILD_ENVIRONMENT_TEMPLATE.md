# Build environment

Record exact installed values, paths and verification commands. Do not fill unknowns with assumed successful values.

- Godot editor and export templates: required 4.7.2 standard
- Renderer: Compatibility
- Language: typed GDScript
- Android: JDK, SDK platform, build tools, NDK and export preset
- Store target baseline checked 2026-10-02: Android API 36 minimum; recheck before shipping
- Product Android floor: API 29, pending native validation
- iOS: Mac model/OS, Xcode, SDK, deployment target, export preset
- Store build baseline: Xcode 26+ and iOS 26 SDK+; recheck before shipping
- Product iOS floor: iOS 16, pending native validation
- Test devices: actual model, OS, RAM if known, build ID, findings
- Package/bundle IDs: temporary until owner selects final IDs
- Signing configuration: reference secure storage location, NEVER the secret value
- Build and headless test commands: verify in this project's actual tool version
- Dependency pins and licenses
