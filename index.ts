import { h as vh, VNode } from 'vue'

function object_map<K extends string, A, B>(xs: Record<K, A>, f: (a: A) => B): Record<K, B> {
    const ys: Partial<Record<K, B>> = {}
    for (const [k, v] of Object.entries(xs))
        ys[k as K] = f(v as A)
    return ys as Record<K, B>
}

type ElementsMap = {
    div: {
        role?: 'tablist'
    },
    span: {},
    p: {},
    em: {},
    strong: {},
    input: {},
    button: {
        type?: 'submit' | 'reset' | 'button',
    },
    img: {
        alt?: string,
        src?: string,
    },
    aside: {},
    article: {},
    main: {},
    nav: {},
    a: {
        href: string,
        role?: 'tab',
    },
    section: {
        role?: 'tabpanel',
    },
    iframe: {
        src: string,
        allow?: string,
        allowfullscreen?: boolean,
        frameborder: number,
    },
}

/** All available HTML elements */
type HTMLElements = keyof ElementsMap

/** A Vue component */
type Component = {
    /** render function for this vue component
     *
     * should either be a string, or a node returned by `h`
     */
    render(): VNode|string;

    /** Vue setup hook
     * https://vuejs.org/api/composition-api-setup.html
     */
    setup?: () => void;
    /** Called when the instance is initialized. */
    beforeCreate?: () => void;
    /** Called after the instance has finished processing all state-related options. */
    created?: () => void;
    /** Called right before the component is to be mounted. */
    beforeMount?: () => void;
    /** Called after the component has been mounted. */
    mounted?: () => void;
    /** beforeUnmount */
    beforeUnmount?: () => void;
    /** Called right before a component instance is to be unmounted. */
    unmounted?: () => void;
    /** Called right before the component is about to update its DOM tree due to a reactive state change. */
    beforeUpdate?: () => void;
    /** Called after the component has updated its DOM tree due to a reactive state change. */
    updated?: () => void;
    /** Called after the component instance is inserted into the DOM as part of a tree cached by `<KeepAlive>`. */
    activated?: () => void;
    /** Called after the component instance is removed from the DOM as part of a tree cached by `<KeepAlive>`. */
    deactivated?: () => void;

    /** A function that returns the initial reactive state for the component instance.
     *
     * https://vuejs.org/api/options-state.html#data
     */
    data?: () => Record<string, any>;

    computed?: Record<string, () => any>;

    watch?: Record<string, (nv: any, ov: any) => void>;

    /** events emitted by this component */
    emits?: Record<string, any>;

    slots?: Record<string, (...xs: any) => VNode | string | Array<VNode> | Array<string>>;

    props?: Record<string, any>;

    /** dom element refs tracked by this component */
    refs?: Record<string, any>;

    /** public component methods */
    methods?: Record<string, Function>;
}

type DefaultProps<T extends HTMLElements> = ElementsMap[T] & {
    /** a css class */
    class?: string,
    /** element id, must be unique globally */
    id?: string,
    innerHTML?: string,
    key?: string | number,
    ref?: string,
    style?: Partial<CSSStyleDeclaration>,

    /** An element receives a click event when a pointing device button (such as a mouse's primary mouse button) is both pressed and released while the pointer is located inside the element.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
     */
    onClick?: (event: MouseEvent) => void,

    /** The mousedown event is fired at an Element when a pointing device button is pressed while the pointer is inside the element.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
     */
    onMousedown?: (event: MouseEvent) => void,

    /** The mousemove event is fired at an element when a pointing device (usually a mouse) is moved while the cursor's hotspot is inside it.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
     */
    onMousemove?: (event: MouseEvent) => void,

    [K: `data-${string}`]: string,
}

type On<T extends Record<string, any>> = {
    [key in keyof T as `on${Capitalize<string & key>}`]: (x: T[key]) => any
}

type Props<T extends Component> =
    DefaultProps<HTMLElements>
    &
    (T extends { props: infer U extends Record<string, any> } ? Partial<U> : {})
    &
    (T extends { emits: infer U extends Record<string, any> } ? Partial<On<U>> : {})

type Slots<T extends Component> =
    T extends { slots: infer U extends Record<string, Function> }
    ? Partial<U>
    : null

/**
 * Helper type to calculate the `this` interface of a Vue component.
 */
export type This<T extends Component> =
    (
        T extends { data: infer U extends () => object }
        ? ReturnType<U>
        : {}
    )
    &
    (
        T extends { slots: infer U extends Record<string, Function> }
        ? { $slots: U }
        : {}
    )
    &
    (
        T extends { computed: infer U extends Record<string, () => any>}
        ? { [K in string & keyof U]: ReturnType<U[K]> }
        : {}
    )
    &
    (
        T extends { methods: infer U extends Record<string, Function> }
        ? U
        : {}
    )
    &
    (
        T extends { emits: infer U extends object }
        ? {
            /** fires a vue event to this component's parent
             *
             * https://vuejs.org/guide/components/events.html
             *
             * - `event` — the event to fire
             * - `value` — the value the event should have
             */
            $emit: <K extends keyof U>(event: K, value: U[K]) => void
        }
        : {}
    )
    &
    (
        T extends { props: infer U extends object }
        ? U
        : {}
    )
    &
    (
        T extends { refs: infer U extends Record<string, any> }
        ? { $refs: U }
        : {}
    )

/** Turn a string or a Vue component into a virtual DOM node for rendering in Vue.
 *
 * - `elem` — a vue component or a DOM element string
 * - `props` — *optional* attributes to pass to the element or component
 * - `slots` — *optional*
 *    - for elements: an array of strings or other elements / components
 *    - for components: a slots object
 */
export function h<T extends HTMLElements | Component>(
    elem: T,
    props?: T extends HTMLElements
        ? DefaultProps<T>
        : T extends Component
        ? Props<T>
        : never,
    slots?: T extends HTMLElements
        ? Array<string|VNode>
        : T extends Component
        ? Slots<T>
        : null
): VNode {
    return vh(
        // @ts-ignore
        elem,
        props,
        slots,
    )
}

/**
 * Converts a Vue component with enhanced type checking
 * to a regular Vue component, while maintining the types.
 */
export function defineComponent<T extends Component>(x: T) {
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
    } as any as T
}

export type WatchFunction<T> = (value: T, oldValue: T) => void

export type Watch<X extends Component> = Partial<
    (
        X extends { data: () => infer O extends Record<string, any> }
        ? { [K in keyof O ]: WatchFunction<O[K]> }
        : {}
    )
     & (
        X extends { props: infer O extends Record<string, any> }
        ? { [K in keyof O ]: WatchFunction<O[K]> }
        : {}
    ) & (
        X extends { computed: infer O extends Record<string, () => any> }
        ? { [K in keyof O ]: WatchFunction<ReturnType<O[K]>> }
        : {}
    )
>

export const vif = (cond: boolean) => (f: () => VNode) => cond ? f() : ''
