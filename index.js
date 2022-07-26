import { h as vh } from 'vue';
export function h(elem, props, slots) {
    return vh(
    // @ts-ignore
    elem, props, slots);
}
h(component, {
    onValue: (x) => console.log(x),
});
