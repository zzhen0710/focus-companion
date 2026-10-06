import type { ExpressionIntent } from '../../experience/rules'

/** Original temporary vector study: a human companion seated in a sunlit reading room. */
export default function PrototypeScene({ intent }: { intent: ExpressionIntent }) {
  const working = intent.presence === 'working'
  const resting = intent.presence === 'paused' || intent.presence === 'onBreak'
  return <div className={`scene-art presence-${intent.presence}`}>
    <svg viewBox="0 0 1600 1000" role="img" aria-labelledby="scene-art-title" preserveAspectRatio="xMidYMid slice">
      <title id="scene-art-title">{`A human companion ${working ? 'studying at a desk' : resting ? 'resting beside her notebook' : 'sharing a quiet study room'}`}</title>
      <defs>
        <linearGradient id="room-wall" x2="0" y2="1"><stop stopColor="#ece0ce" /><stop offset="1" stopColor="#cbbcad" /></linearGradient>
        <linearGradient id="window-sky" x2="0" y2="1"><stop stopColor="#a6bac1" /><stop offset="1" stopColor="#dee0cc" /></linearGradient>
        <linearGradient id="hair-shade" x2="1" y2=".7"><stop stopColor="#71514b" /><stop offset=".5" stopColor="#4b3538" /><stop offset="1" stopColor="#382c32" /></linearGradient>
        <linearGradient id="skin-light" x2=".8" y2="1"><stop stopColor="#f7dcc5" /><stop offset="1" stopColor="#d8ad98" /></linearGradient>
        <linearGradient id="sage-cloth" x2="1" y2="1"><stop stopColor="#9bada1" /><stop offset="1" stopColor="#637e77" /></linearGradient>
        <linearGradient id="desk-wood" x2="0" y2="1"><stop stopColor="#c2a487" /><stop offset="1" stopColor="#94735e" /></linearGradient>
        <radialGradient id="window-light"><stop stopColor="#fff1d4" stopOpacity=".8" /><stop offset="1" stopColor="#fff1d4" stopOpacity="0" /></radialGradient>
      </defs>
      <g className="environment-layer">
        <path fill="url(#room-wall)" d="M0 0h1600v1000H0Z" />
        <path fill="#bdb1a5" d="M0 750 1600 700v300H0Z" />
        <path stroke="#a5988d" strokeWidth="2" opacity=".3" d="M0 850 1600 804M0 970 1600 911M290 741l-80 259m450-272 38 272m435-287 144 287" />
        <ellipse cx="513" cy="448" rx="620" ry="650" fill="url(#window-light)" />
        <path fill="#ab9a88" d="M90 100h490v475H90Z" />
        <path fill="url(#window-sky)" d="M105 115h460v437H105Z" />
        <path fill="#a6b4a1" d="m105 454 88-55 87 34 110-99 175 90v128H105Z" />
        <path fill="#80968b" opacity=".65" d="m105 504 175-43 87 20 128-34 70 28v77H105Z" />
        <path fill="#e9dbc3" d="M105 317h460v14H105Zm218-202h14v437h-14Z" />
        <path fill="#e1d4bc" d="M77 552h520v23H77Z" />
        <path fill="#dfd3bf" d="M54 80h68q-47 212-14 502l-66 15Q21 277 54 80Zm490 0h67q42 247 1 496l-60-8q27-283-8-488Z" />
        <path fill="none" stroke="#c6bba6" strokeWidth="4" opacity=".65" d="M65 112Q40 302 67 557m522-441q27 227-1 413" />
        <g opacity=".65">
          <path fill="#b6a58f" d="M1047 165h135v179h-135Z" /><path fill="#e9e2d3" d="M1056 175h117v160h-117Z" />
          <path fill="none" stroke="#9aa897" strokeWidth="3" d="M1088 299q53-62 45-96m-19 48-26-13m37-4 21-17" />
          <path fill="#bdad98" d="M1235 466h296v14h-296Z" />
          <path fill="#889994" d="M1270 401h25v65h-25Z" /><path fill="#b89682" d="M1301 420h36v46h-36Z" />
          <path fill="#d2c6b2" d="m1342 412 20-4 12 57-20 4Z" />
          <path fill="#9aa28a" d="M1434 443h43l-7 23h-29Z" />
          <path fill="#839683" d="M1451 445q-43-32-12-57 17 17 12 57m4-9q18-42 40-24-7 20-40 24Z" />
        </g>
        <path fill="#a7a799" d="M1120 696q0-39 38-39h344q36 0 36 37v92h-418Z" />
        <path fill="#b9b8a6" d="M1120 728h418v73h-418Z" /><path fill="#d0c5b3" d="m1154 672 96-8 13 58-101 3Z" />
        <ellipse cx="713" cy="885" rx="533" ry="98" fill="#a3a99b" opacity=".45" />
        <ellipse cx="711" cy="885" rx="498" ry="82" fill="none" stroke="#d0cbbb" strokeWidth="3" opacity=".5" />
        <path fill="#b2a38d" d="M213 667h76l-10 120h-53Z" />
        <g fill="#728b75"><path d="M252 686q-85-28-68-91 57 15 68 91Z" /><path d="M254 668q-28-92 9-133 45 65-9 133Z" /><path d="M259 686q6-72 68-78-12 65-68 78Z" /></g>
      </g>
      <g className="furniture-layer">
        <path fill="#806758" d="M731 517q-37-85 21-123 48-32 119 2 36 24 37 104v247H731Z" />
        <path fill="#b39d83" d="M746 516q-30-89 10-109 51-26 106 6 29 19 28 103v193H746Z" />
        <path fill="#7d6354" d="M719 738h214v27H719Zm13 27h19l-26 149h-18Zm164 0h20l32 149h-18Z" />
      </g>
      <g className="companion-layer">
        {/* Long tied hair, seated proportions, and hands belong to the room's desk plane. */}
        <path fill="url(#hair-shade)" d="M684 324q-28-116 59-161 71-42 138 11 54 40 31 143l-7 196q-102 37-215-2Z" />
        <path fill="#665049" d="M699 487q-38 34-12 65-31 39-3 66-27 36 3 69l32-13q17-30-5-51 29-29 3-62 29-29 2-54Z" />
        <path fill="none" stroke="#98736a" strokeWidth="3" opacity=".5" d="m696 513 16 33-22 27 16 36-14 33" />
        <path fill="#af8d75" d="m685 673 34-7 5 13-36 9Z" />
        <path fill="#594c56" d="M721 657q71-23 147 2l24 107-11 133-45 9-33-154-9 153-53 5-38-148Z" />
        <path fill="#76636c" d="m755 696 41 17-13 171-21-13Z" />
        <path fill="#d9cebd" d="m740 890 48-4 7 55-49 6Z" /><path fill="#d9cebd" d="m837 889 43-3 15 55-48 6Z" />
        <path fill="#66584e" d="M741 925q-38 21-29 38h88l-9-36Z" /><path fill="#66584e" d="M842 926q-13 25 0 37h92q-1-26-49-38Z" />
        <path fill="url(#skin-light)" d="m767 340-8 50 44 27 36-31-7-55Z" />
        <path fill="#c89986" d="M768 350q30 25 66-4l-2 26q-27 19-68 4Z" />
        <path fill="#eee3cf" d="M757 385q47 20 82-1l39 53-13 220q-77 22-136-5l-7-208Z" />
        <path fill="url(#sage-cloth)" d="M753 382q-57-2-85 45l-29 137 44 28 49-112-11 183 47 9 8-217Zm89 1q51 11 67 58l48 125-50 24-47-105 11 178-52 12-9-219Z" />
        <path fill="none" stroke="#55726c" strokeWidth="3" d="m744 407-15 78 29 21-27 81m117-177 18 78-29 17 29 83" />
        <path fill="#dfd5c2" d="m762 387 15 36 24-19-17 45-33-51m84-10-18 33-16-17 17 44 33-47" />
        <path fill="#bca58b" d="M795 446h4v11h-4Zm-1 42h4v10h-4Z" />
        <path fill="url(#skin-light)" stroke="#b78978" strokeWidth="2" d="M711 257q-3-63 40-81 67-30 122 34l-5 88q-6 49-64 69-59-15-76-52Z" />
        <path fill="url(#skin-light)" d="M716 268q-19-17-17 5 1 27 26 33m147-47q22-16 18 10-2 21-22 28" />
        <path fill="url(#hair-shade)" d="M705 260q-9-86 50-104 92-26 124 69l-10 59-12-62q-10 17-28 24l4-37-24 37-11-34q-26 49-57 53l12-50q-17 35-36 45l-1 43Z" />
        <path fill="none" stroke="#a17b69" strokeWidth="4" opacity=".5" d="M735 196q27-40 63-26m13 1q29 8 43 34" />
        <path fill="#c5b089" d="m856 220 8-3 6 26-8 3Z" />
        <g className="companion-eyes">
          {resting ? <g fill="none" stroke="#5c4141" strokeWidth="3.5" strokeLinecap="round"><path d="M738 282q15 10 31-2" /><path d="M815 278q14 10 27-2" /></g>
            : <><path fill="#fff4e9" d="M734 277q17-17 38-2l-3 19q-23 7-35-7Z" /><path fill="#fff4e9" d="M813 274q18-17 32-3l1 17q-15 9-30 4Z" />
              <ellipse cx={working ? 754 : 752} cy={working ? 288 : 283} rx="9" ry="12" fill="#71877b" /><ellipse cx={working ? 830 : 827} cy={working ? 284 : 279} rx="8" ry="12" fill="#71877b" />
              <ellipse cx={working ? 754 : 752} cy={working ? 289 : 285} rx="4" ry="8" fill="#394641" /><ellipse cx={working ? 830 : 827} cy={working ? 286 : 281} rx="4" ry="8" fill="#394641" />
              <circle cx="750" cy="278" r="3" fill="#fff9ef" /><circle cx="825" cy="275" r="3" fill="#fff9ef" />
              <path fill="none" stroke="#5c4141" strokeWidth="3.5" strokeLinecap="round" d="M731 277q21-14 41-2m40-1q16-13 35-3" /></>}
        </g>
        <path fill="none" stroke="#aa7e6e" strokeWidth="2" strokeLinecap="round" d="m792 291-4 17 7 2m-18 21q14 5 26-2" />
        <ellipse cx="744" cy="313" rx="13" ry="5" fill="#d6a092" opacity=".35" /><ellipse cx="837" cy="310" rx="10" ry="4" fill="#d6a092" opacity=".3" />
      </g>
      <g className="foreground-layer">
        <path fill="#80614f" d="m376 689 629 10 73 45-697 9Z" />
        <path fill="url(#desk-wood)" d="m373 675 626 10 80 42-703 11Z" />
        <path fill="#9a785e" d="m380 736 697-9-2 25-694 10Z" />
        <path fill="#775e50" d="M413 762h28l-20 230h-26Zm587-10h26l41 240h-25Z" />
        <path fill="#c2a185" d="m455 778 515-13v10l-515 15Z" />
        <path fill="#dac7a4" d="m442 647 112-5 26 26-115 8Z" /><path fill="#82998f" d="m445 637 111-4 25 24-115 9Z" />
        <path fill="#ece1c8" d="m629 676 105-15 79 23-105 16Z" /><path fill="#f5ead4" d="m734 661 110-7 59 23-90 7Z" />
        <path fill="none" stroke="#c4b393" strokeWidth="2" d="m734 663 77 19m-153-2 61-9m36-7 64-4m-147 27 39-7" />
        <path fill="url(#skin-light)" d={working ? 'M675 548q-8 63 35 100l58 20-7 16-70-11q-63-30-66-98Z' : 'M675 548q-5 62 44 94l50 12-5 20-60-7q-65-20-79-90Z'} />
        <path fill="url(#skin-light)" d={resting ? 'M926 551q31 53-5 98l-47 22-15-10 40-34-21-53Z' : 'M923 551q25 70-36 100l-46 18-15-11 51-33-5-55Z'} />
        <path fill="#c3d0c0" d="m626 551 53-16 7 27-55 17Zm249-7 50-15 11 25-51 20Z" />
        <path fill="none" stroke="#b9907d" strokeWidth="1.8" d="m747 669 20 6m-14-1 11 6m79-22-11 10m19-6-12 9" />
        {working && <path fill="none" stroke="#5b7771" strokeWidth="4" strokeLinecap="round" d="m752 661 25 28" />}
        <path fill="#a7b4a2" d="M940 637h45v44h-45Z" /><path fill="none" stroke="#a7b4a2" strokeWidth="7" d="M985 644q25-2 15 24h-15" />
        <path fill="#647568" d="M428 651h44v9h-44Z" /><path fill="#71837b" d="M440 538h9v116h-9Z" />
        <path fill="none" stroke="#71837b" strokeWidth="7" d="M444 543q-20-47 16-80l25-19" />
        <path fill="#879a8c" d="m472 425 47 12 13 50-77-13Z" /><path fill="#eed6a7" d="m462 474 65 12-4 7-61-12Z" />
        <path fill="#e8cf9d" opacity=".15" d="m476 484 64 150 75 24-92-172Z" />
      </g>
    </svg>
    {intent.ambient && <div className="ambient-note" aria-label="Review pending"><span aria-hidden="true">◇</span> A little work to revisit</div>}
    {intent.primary && <p className="companion-acknowledgment" role="status" key={`${intent.primary.kind}:${intent.primary.factId}`}>
      {intent.primary.kind === 'focusAcknowledgment' ? 'Focus session saved.' : 'Task completion saved.'}
    </p>}
  </div>
}
