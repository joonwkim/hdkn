type propEvent<Type> = { on<Key extends string & keyof Type>(eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void): void; };

export function makeWatchedObject<Type>(obj: Type): Type & propEvent<Type> {
    const cbMap = new Map<string, Function>();
    var proxy = new Proxy({
        ...obj, on<Key extends string & keyof Type>(eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void): void { const name = eventName.replace("Changed", ""); cbMap.set(name, callback); },
    }, {
        set: function (target, propKey: string, value) { const fn = cbMap.get(propKey); fn && fn(value); return Reflect.set(target, propKey, value); }
    })
    return proxy;
}



// how to Use
// const obj = makeWatchedObject({
//     checked: false,
// });

// // newValue type is string
// obj.on('checkedChanged', (newValue) => {
//     console.log('name changed ->', newValue);
// });


// obj.checked = true


