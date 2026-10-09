import type { CSSProperties } from 'react'
import type { ExpressionIntent } from '../experience/rules'

// One registered camera transforms the entire scene, including future layers.
const framing = {
  '--scene-width': 2560, '--scene-height': 1440,
  '--camera-x': 400, '--camera-y': 40, '--camera-width': 1440, '--camera-height': 1280,
} as CSSProperties

/** Frozen, flattened artwork. Separate animated layers are not available yet. */
export default function SceneArtwork({ presence }: { presence: ExpressionIntent['presence'] }) {
  return <div className="scene-artwork" data-scene-artwork data-presence={presence} style={framing}>
    <div className="scene-camera" data-scene-camera>
      <img className="scene-master" src={`${import.meta.env.BASE_URL}assets/scene/scene_master.png`}
        width={2560} height={1440} draggable={false}
        alt="A companion writing in a nighttime study room with a sleeping cat" />
    </div>
    <div className="scene-periphery" data-art-layer="peripheral-atmosphere" aria-hidden="true" />
  </div>
}
