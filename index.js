var ai = 0;
var curState;
var historyStateMap = [];

var fetch = function(historyId, method){
    var state = historyStateMap[historyId]
    state && typeof state[method] === 'function' && state[method](state.state);
}
//push(push进去之后执行的func，被pop出来之后执行的func)
var changeState = function(method){
    return function(state, title, url, forwardFunc, backFunc){
        if(method === 'replaceState'){
            curState && fetch(curState.$id, 'pop');
            curState = {
                $id : ai
            };
        }
        else{
            curState = {
                $id : ai++
            };
        }

        history[method](curState, document.title = title || document.title, url || location.href);

        historyStateMap.splice(ai);
        historyStateMap[curState.$id] = {
            push : forwardFunc,
            pop : backFunc,
            state : curState
        }
        fetch(curState.$id, 'push');
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
    }
    //forward
    else{
        fetch(state.$id, 'push');
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
    reload : window.location.reload
}

