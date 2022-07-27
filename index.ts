import { h as vh, VNode } from 'vue'

/** All available HTML elements */
type HTMLElements = 'div' | 'span' | 'p' | 'em' | 'strong' | 'input'

/** A Vue component */
type Component = {
    render(): VNode|string;

    setup?: () => void;
    beforeCreate?: () => void;
    created?: () => void;
    beforeMount?: () => void;
    mounted?: () => void;
    beforeUnmount?: () => void;
    unmounted?: () => void;
    beforeUpdate?: () => void;
    updated?: () => void;
    activated?: () => void;
    deactivated?: () => void;

    data?: () => Record<string, any>;

    computed?: Record<string, () => any>;

    watch?: Record<string, (ov: any, nv: any) => void>;

    emits?: Record<string, any>;

    slots?: Record<string, Array<any>>;

    props?: Record<string, any>;
}

type DefaultProps<T extends HTMLElements> = {
    /** a css class */
    class?: string,
    /** element id, must be unique globally */
    id?: string,
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
    T extends { slots: infer U extends Record<string, Array<any>> }
    ? {[k in string & keyof U]: (...xs: U[k]) => VNode|string }
    : null

/**
 * Helper type to calculate the `this` interface of a Vue component.
 */
export type This<T extends Component> =
    (
        T extends { data: infer U extends object }
        ? U
        : {}
    )
    &
    (
        T extends { slots: infer U extends Record<string, any> }
        ? {[K in string & keyof U]: U[K]}
        : {}
    )
    &
    (
        T extends { computed: infer U extends Record<string, () => any>}
        ? {[K in string & keyof U]: ReturnType<U[K]> }
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
        ? {$emit: <K extends keyof U>(event: K, value: U[K]) => void }
        : {}
    )

/**
 * Turn a string or a Vue component into a virtual DOM node
 * for rendering in Vue.
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
        ? [Slots<T>]
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
        props: Object.keys(x)
    } as any as T
}
