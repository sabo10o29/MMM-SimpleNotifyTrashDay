const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('MMM-SimpleNotifyTrashDay.js', 'utf8');
function load(extra = {}) {
  let definition;
  const context = vm.createContext({ Module: { register(name, value) { definition = value; } }, ...extra });
  vm.runInContext(source, context);
  return { definition, run: expression => vm.runInContext(expression, context) };
}
const trash = '{ DOW: ["mon"], NOW: [1,2,3,4,5], LABEL: "Trash" }';
test('month range includes the final month regardless of time of day', () => {
  assert.equal(load().run('getMonthsInRange(new Date(2026,0,31,23),new Date(2026,1,1,0)).length'), 2);
});
test('cutoff clears inherited minutes and seconds', () => {
  assert.equal(load().run('getDateFromDayOfMonth(new Date(2026,10,17,12,34,56,789),1,1,8).getTime() === new Date(2026,10,2,8).getTime()'), true);
});
test('invalid weekday returns without looping; nonexistent fifth weekday is omitted', () => {
  const {run} = load();
  assert.equal(run('getDateFromDayOfMonth(new Date(2026,1,1),undefined,1,8)'), null);
  assert.equal(run('getDateFromDayOfMonth(new Date(2026,1,1),1,5,8)'), null);
});
test('year boundary, duplicates, and exact expiration', () => {
  const {run} = load();
  assert.equal(run(`getNotificationItems([${trash}], new Date(2026,11,31,23), new Date(2027,0,4,23,59),8).length`), 1);
  assert.equal(run(`getNotificationItems([${trash}], new Date(2026,10,2,8,0,0,1),new Date(2026,10,2,23),8).length`), 0);
  assert.equal(run(`getNotificationItems([{DOW:['mon','mon'],NOW:[1,1],LABEL:'x'}],new Date(2026,10,1),new Date(2026,10,2,23),8).length`), 1);
});
test('end of month midnight expiration retains collection date', () => {
  assert.equal(load().run("getNotificationItems([{DOW:['sat'],NOW:[5],LABEL:'x'}],new Date(2026,1,1),new Date(2026,1,1,23),24)[0].trashDate.getTime() === new Date(2026,0,31).getTime()"), true);
});
test('leap day and fractional expiration', () => {
  assert.equal(load().run('getDateFromDayOfMonth(new Date(2028,1,1),2,5,8.5).getTime() === new Date(2028,1,29,8,30).getTime()'), true);
});
test('invalid configuration is rejected including prototype property names', () => {
  const {definition,run} = load();
  assert.throws(() => run(`validateConfig({...${JSON.stringify(definition.defaults)},trashDay:[{DOW:['toString'],NOW:[1],LABEL:'x'}]})`));
  for (const notify of [-1, Infinity, '7', 3661]) {
    assert.throws(() => run(`validateConfig({...${JSON.stringify(definition.defaults)},notify:${JSON.stringify(notify)}})`));
  }
});
test('rendering treats title, labels and date format output as text', () => {
  class Element {
    children = []; style = {}; textContent = '';
    constructor(tag) { this.tag = tag; }
    set innerHTML(_) { throw Error('Unsafe HTML insertion'); }
    appendChild(child) { this.children.push(child); }
  }
  const {definition} = load({document:{createElement: tag => new Element(tag)},moment:()=>({format:()=>'<img src=x>'})});
  const instance = {config:{...definition.defaults,title:'<script>x</script>',notify:7,expiredTime:24,trashDay:[{DOW:['sun','mon','tue','wed','thu','fri','sat'],NOW:[1,2,3,4,5],LABEL:'<img onerror=x>'}]},data:{position:'top_right'}};
  const dom = definition.getDom.call(instance);
  assert.equal(dom.children[0].textContent, instance.config.title);
  assert.equal(dom.children[1].children[0].children[1].textContent, '<img onerror=x>');
});
test('timers are cleaned up on suspend, restart, and repeated resume', () => {
  let next = 0; const active = new Set();
  const {definition} = load({setInterval(){active.add(++next);return next;},clearInterval(id){active.delete(id);}});
  const instance = {config:definition.defaults,updateDom(){}};
  definition.start.call(instance); definition.start.call(instance);
  assert.equal(active.size,1);
  definition.suspend.call(instance); assert.equal(active.size,0);
  definition.resume.call(instance); definition.resume.call(instance); assert.equal(active.size,1);
});
test('empty configuration renders an empty wrapper', () => {
  const {definition} = load({document:{createElement:()=>({})}});
  assert.deepEqual(definition.getDom.call({config:definition.defaults}), {className:'simple-notify-trash-day'});
});
