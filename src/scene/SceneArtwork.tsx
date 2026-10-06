import type { ExpressionIntent } from '../experience/rules'

/** Temporary registration/occlusion study. These shapes are NOT release artwork. */
export default function SceneArtwork({ presence }: { presence: ExpressionIntent['presence'] }) {
  return <div className="scene-artwork" data-scene-artwork data-presence={presence}>
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Temporary structural artwork: a human companion in a nighttime study room with a sleeping cat">
      <g data-art-layer="room-window"><rect width="1600" height="1000" fill="#30283e" />
        <rect x="700" y="60" width="540" height="620" rx="10" fill="#223552" />
        <path d="M970 60V680M700 360H1240" stroke="#55475e" strokeWidth="20" />
        <circle cx="1120" cy="180" r="36" fill="#abb4c8" /></g>
      <g data-art-layer="background-light"><ellipse cx="340" cy="540" rx="420" ry="410" fill="#cb9d68" fillOpacity=".12" /></g>
      <g data-art-layer="rear-furniture"><rect x="50" y="190" width="250" height="510" fill="#574452" />
        <path d="M60 350H290M60 520H290" stroke="#9c7970" strokeWidth="10" />
        <rect x="85" y="245" width="30" height="98" fill="#748574" /><rect x="130" y="240" width="42" height="103" fill="#ac8b72" /></g>
      <g data-art-layer="companion-body"><ellipse cx="560" cy="650" rx="210" ry="270" fill="#66566e" />
        <path d="M370 500Q410 400 450 390L665 390Q730 470 750 790H350Z" fill="#777b79" />
        <path d="M410 430Q345 160 535 135Q765 125 725 450L655 510H440Z" fill="#493c50" />
        <ellipse cx="558" cy="332" rx="118" ry="145" fill="#c4a59b" />
        <path d="M435 290Q410 125 558 155Q710 145 700 290L640 233 562 267 475 230Z" fill="#655069" /></g>
      <g data-art-layer="desk-props"><path d="M90 750H1260L1450 960H0Z" fill="#775e64" />
        <path d="M440 756L560 735 730 775 620 830Z" fill="#d0c1a8" />
        <rect x="795" y="695" width="55" height="75" rx="8" fill="#baa2a0" />
        <path d="M840 710Q884 715 843 750" fill="none" stroke="#baa2a0" strokeWidth="12" /></g>
      <g data-art-layer="hands-contact"><path d="M400 660L477 751 530 775" fill="none" stroke="#c4a59b" strokeWidth="36" strokeLinecap="round" />
        <path d="M680 650L655 740 590 769" fill="none" stroke="#c4a59b" strokeWidth="36" strokeLinecap="round" /></g>
      <g data-art-layer="expression-overlay" data-expression={presence} fill="none" stroke="#483b47" strokeWidth="6" strokeLinecap="round">
        {presence === 'onBreak' ? <path d="M490 327Q510 342 530 327M585 327Q605 342 625 327" />
          : <path d={presence === 'working' ? 'M494 335H523M589 335H618' : 'M500 322V338M608 322V338'} />}
        <path d="M548 389H569" /></g>
      <g data-art-layer="sleeping-cat"><ellipse cx="245" cy="815" rx="108" ry="48" fill="#bba696" />
        <circle cx="180" cy="788" r="42" fill="#bba696" /><path d="M150 763L146 730 174 748M187 747L215 733 213 770" fill="#bba696" />
        <path d="M157 790H173M187 790H200" stroke="#594750" strokeWidth="3" /></g>
      <g data-art-layer="steam-local-light"><path d="M815 676Q796 650 819 628M833 684Q857 657 835 632" fill="none" stroke="#ded3cc" strokeOpacity=".55" strokeWidth="3" />
        <path d="M300 720V520L380 490" stroke="#a99287" strokeWidth="9" fill="none" />
        <path d="M345 483Q390 441 420 498Z" fill="#c9a777" /></g>
    </svg>
    <div className="scene-periphery" data-art-layer="peripheral-atmosphere" aria-hidden="true" />
  </div>
}
