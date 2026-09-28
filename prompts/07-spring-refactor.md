# Spring refactor

Cheap motion eases from A to B on a fixed curve. Expensive motion has mass: it accelerates,
overshoots a hair, settles. Paste this when a film feels linear or floaty.

```
Replace every easing curve with closed-form springs from lib/motion.js. Tiny overshoot on UI,
none on type. Any value with more than one target uses track().
```

Presets (`SPRING` in `lib/motion.js`):

| Preset | k, d | Use for |
|---|---|---|
| `snappy` | 320, 30 | buttons, toggles, leading edges |
| `default` | 170, 26 | cards, containers, camera |
| `heavy` | 90, 19 | big type, 3D objects, logo lockups |
| `playful` | 200, 12 | mascots, stickers (visible overshoot) |
