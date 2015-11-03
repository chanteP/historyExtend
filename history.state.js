var ai = 0;
var curState;
var historyStateMap = [];

var backFuncList = [],
    forwardFuncList = [],
    changeList = [];

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

        setState(method, curState, document.title = title || document.title, url);

        merge(curState, stateData);

        historyStateMap.splice(ai);
        historyStateMap[curState.$id] = {
            push : forwardFunc,
            pop : backFunc,
            state : curState
        }
        fetch(curState.$id, 'push');

        runList(forwardFuncList);
        runList(changeList);
    }
}
var replaceState = changeState('replaceState');
var pushState = changeState('pushState');
var popState = function(state){
    if(!state){return;}
    var stateObj;
    // console.log(state.$id, curState.$id)
    //back
    if(state.$id <= ai - 1){
        fetch(curState.$id, 'pop');
        runList(backFuncList);
    }
    //forward
    else{
        fetch(state.$id, 'push');
        runList(forwardFuncList);
    }
    runList(changeList);
    ai = state.$id + 1;
}

var api = module.exports = {
    pushState : pushState,
    replaceState : replaceState,
    back : function(){
        history.go(-1);    
    },
    forward : function(){
        history.go(1);    
    },
    onpopstate : function(func){
        window.addEventListener('popstate', function(e){
            func(e);
        });
    },
    onstatechange : function(func){
        changeList.push(func);
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
    history : historyStateMap
}

api.onpopstate(function(e){
    popState(e.state);
    curState = e.state;
});

//通用
function fetch(historyId, method){
    var state = historyStateMap[historyId];
    state && typeof state[method] === 'function' && state[method](state.state);
}
function runList(list){
    list.forEach(function(func){
        func();
    });
}
function setState(method, state, title, url){
    history[method](state, title, url);
}
function merge(o1, o2){
    if(!o2){return o1;}
    for(var key in o2){
        if(o2.hasOwnProperty(key)){
            o1[key] = o2[key];
        }
    }  
    return o1;
}