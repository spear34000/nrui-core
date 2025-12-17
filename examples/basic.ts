import { createReality, forkReality } from '../core/reality';
import { observe } from '../core/observe';
import { element, text } from '../core/ui';
import { View } from '../core/view';

const view: View = (context) => {
  const clicks = context.times('clicked');
  return element('button', [text(`forks: ${clicks}`)], {
    forkBind: { id: 'clicked', activation: 'click' },
    props: { attributes: { type: 'button' } },
  });
};

const base = createReality();
const firstReality = forkReality(base, 'clicked');
const secondReality = forkReality(firstReality, 'clicked');

console.log('base', observe(view, base));
console.log('after two forks', observe(view, secondReality));
