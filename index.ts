import { h as vh, VNode } from 'vue'

type HTMLElements = 'div' | 'span' | 'p' | 'em' | 'strong' | 'input'

type Component = { render(): VNode|string }

type DefaultProps<T extends HTMLElements> = {
    class?: string,
    id?: string,
}

type On<T extends Record<string, any>> = {
    [key in keyof T as `on${Capitalize<string & key>}`]: (x: T[key]) => any
}

type Props<T extends object> =
    DefaultProps<HTMLElements>
    &
    (T extends { props: infer U } ? U : {})
    &
    (T extends { emits: infer U extends Record<string, any> } ? On<U> : {})

type Slots<T extends object> = T extends { slots: infer U extends Array<string> }
    ? {[k in U[number]]: () => VNode|string }:
    null

export type This<T extends object> =
    (T extends { data: infer U extends object } ? U : {})
    &
    (T extends { computed: infer U extends Record<string, () => any>} ? {[K in string & keyof U]: ReturnType<U[K]> } : {})
    &
    (T extends { methods: infer U extends Record<string, Function> } ? U : {})
    &
    (T extends { emits: infer U extends object } ? {$emit: <K extends keyof U>(event: K, value: U[K]) => void } : {})

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

declare const component: {
    render: () => 'yo',
    emits: {
        'value': number
    }
}

h(
    component,
    {
        onValue: (x) => console.log(x),
    },
)
