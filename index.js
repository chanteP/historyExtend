var ai = 0;
var curState;
var historyStateMap = [];

var backFuncList = [],
    forwardFuncList = [],
    pushFuncList = [];

var fetch = function(historyId, method){
    var state = historyStateMap[historyId];
    state && typeof state[method] === 'function' && state[method](state.state);
}
var runList = function(list){
    list.forEach(function(func){
        func();
    });
}

//push(push进去之后执行的func，被pop出来之后执行的func)
var changeState = function(method){
    return function(state, title, url, forwardFunc, backFunc, stateData){
        if(method === 'replaceState'){
            curState && fetch(curState.$id, 'pop');
            curState = {
                $id : ai
            };
        }
        else{
            curState = {
                $id : ++ai
            };
        }

        history[method](curState, document.title = title || document.title, url || location.href);

        if(stateData){
            for(var key in stateData){
                if(stateData.hasOwnProperty(key)){
                    curState[key] = stateData[key];
                }
            }   
        }

        historyStateMap.splice(ai);
        historyStateMap[curState.$id] = {
            push : forwardFunc,
            pop : backFunc,
            state : curState
        }
        fetch(curState.$id, 'push');

        runList(forwardFuncList);
    }
}
var replaceState = changeState('replaceState');
var pushState = changeState('pushState');
var popState = function(state){
    if(!state){return;}
    var stateObj;
    //back
    if(state.$id < ai - 1){
        fetch(curState.$id, 'pop');
        runList(backFuncList);
    }
    //forward
    else{
        fetch(state.$id, 'push');
        runList(forwardFuncList);
    }
    ai = state.$id + 1;
}
window.addEventListener('popstate', function(e){
    popState(e.state);
    curState = history.state;
});

module.exports = {
    pushState : pushState,
    replaceState : replaceState,
    back : history.back,
    forward : history.forward,
    onpopstate : function(func){
        window.addEventListener('popstate', func);
    },
    onback : function(func){
        if(typeof func === 'function'){
            backFuncList.push(func);
        }
    },
    onforward : function(func){
        if(typeof func === 'function'){
            forwardFuncList.push(func);
        }
    },
    reload : window.location.reload,
    stack : historyStateMap
}

