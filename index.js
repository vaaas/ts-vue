import { h as vh } from 'vue';
function object_map(xs, f) {
    const ys = {};
    for (const [k, v] of Object.entries(xs))
        ys[k] = f(v);
    return ys;
}
/**
 * Turn a string or a Vue component into a virtual DOM node
 * for rendering in Vue.
 */
export function h(elem, props, slots) {
    return vh(
    // @ts-ignore
    elem, props, slots);
}
/**
 * Converts a Vue component with enhanced type checking
 * to a regular Vue component, while maintining the types.
 */
export function defineComponent(x) {
    return {
        render: x.render,
        setup: x.setup,
        beforeCreate: x.beforeCreate,
        created: x.created,
        beforeMount: x.beforeMount,
        mounted: x.mounted,
        beforeUnmount: x.beforeUnmount,
        unmounted: x.unmounted,
        beforeUpdate: x.beforeUpdate,
        updated: x.updated,
        activated: x.activated,
        deactivated: x.deactivated,
        data: x.data,
        computed: x.computed,
        watch: x.watch,
        props: x.props
            ? object_map(x.props, x => ({ default: x }))
            : [],
        methods: x.methods,
    };
}
