# NRUI Core

NRUI는 **상태, 시간, 이벤트**를 부정하는 새로운 UI 프로그래밍 모델입니다. 입력은 값을 바꾸지 않고 **Fork(현실 분기)**를 선언하며, 관찰(`observe`)은 순수한 UI AST만을 생성합니다. 이 저장소는 렌더러와 독립적인 코어, DOM 렌더러, 예제, 테스트를 제공합니다.

## 모델 한눈에 보기
- **Reality**: 불변 부모 체인에 누적된 fork 기록만 담습니다.
- **Fork**: 새로운 현실을 선언하는 입력 캡처입니다. 파생 상태나 의미를 저장하지 않습니다.
- **RealityContext**: Reality를 읽기 위한 순수 API (`has`, `times`, `occurrences`, `history`).
- **Query<T>**: `(RealityContext) => T` 형태의 순수 함수. 캐싱으로 의미를 바꾸지 않습니다.
- **Observation**: `(RealityContext) => UI AST` 투영. DOM을 모릅니다.
- **UI AST**: `element | text | fragment` 구조에 선택적 `forkBind`를 포함합니다.
- **Renderer**: UI AST를 호스트에 투영하며, 호스트 입력을 fork 생성으로만 연결합니다.

## 파일 구조
- `MODEL.md`: NRUI 헌법(불변 원칙)과 온톨로지 설명.
- `core/`: Reality, Query, View, observe/explain, UI AST 빌더와 고정(freeze) 유틸.
- `renderer/`: DOM 해석기. fork binding을 호스트 입력에 연결합니다.
- `examples/`: 기본 예제.
- `tests/`: 결정성, 순수성, 렌더러 동작을 검증하는 스위트.

## 빠른 시작
```bash
npm install
npm test
```

## 사용 예시
```ts
import { createReality, forkReality } from './core/reality';
import { observe } from './core/observe';
import { renderDOM } from './renderer/dom';
import { element, text } from './core/ui';

const view = (context) =>
  element('button', [text(`clicks: ${context.times('click')}`)], {
    forkBind: { id: 'click', activation: 'click' },
    props: { attributes: { type: 'button' } },
  });

const reality = forkReality(createReality(), 'click');
const ui = observe(view, reality);

renderDOM(document.getElementById('app')!, ui, {
  fork: (id, payload) => console.log('fork', id, payload),
});
```

## 설계 선택
- 관찰 결과(UI AST)와 추적(trace)은 깊게 `freeze`되어 관찰 후 변형이 불가능합니다. 이는 “관찰은 순수하다”는 헌법을 코드 차원에서 강제합니다.
- Reality는 부모 포인터 체인만 가진 불변 구조로, 파생 상태나 시간 개념을 허용하지 않습니다.
- DOM 렌더러는 fork binding을 호스트 입력에 대응시키고, payload 추출(`value`, `checked`, `text`)만을 허용합니다.

## 테스트
`npm test`는 TypeScript 빌드 후 순수성/결정성/렌더러 연결을 검증합니다.
