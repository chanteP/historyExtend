var ai = 0;
var curState;
var historyStateMap = [];

var backFuncList = [],
    forwardFuncList = [],
    changeList = [],
    popStateList = [];

var hashChangeBlock;

//不支持history state的情况，使用hashchange
var changeState = function(method){
    return function(state, title, url, forwardFunc, backFunc, stateData){
        hashChangeBlock = true;
        if(method === 'replace'){
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
var popState = function($id){
    var stateObj;
    // console.log('pop',curState.$id, $id, ai)
    //back
    if($id < ai){
        fetch(curState.$id, 'pop');
        runList(backFuncList);
    }
    //forward
    else{
        fetch($id, 'push');
        runList(forwardFuncList);
    }
    runList(changeList);
    ai = $id;
}

var replaceState = changeState('replace');
var pushState = changeState('hash');

var api = module.exports = {
    pushState : pushState,
    replaceState : replaceState,
    back : function(){
        return history.go(-1);
    },
    forward : history.forward,
    onpopstate : function(func){
        if(typeof func === 'function'){
            popStateList.push(func);
        }
    },
    onstatechange : function(func){
        changeList.push(func);
    },
    onback : function(func){
        if(typeof func === 'function'){
            backFuncList.push(func);
        }
    },
    onexit : function(func){
        if(typeof func === 'function'){
            exitFuncList.push(func);
        }
    },
    onforward : function(func){
        if(typeof func === 'function'){
            forwardFuncList.push(func);
        }
    },
    reload : function(){
        window.location.reload();
    },
    history : historyStateMap
}

window.addEventListener('hashchange', function(e){
    if(hashChangeBlock){
        hashChangeBlock = false;
        return;
    }
    if(!curState){return;}
    var match = /\<\<([\d]+)\>\>/.exec(location.hash);
    var $id;
    if(!match){
        $id = 0;
    }
    else{
        $id = +match[1];
    }
    if($id === curState.$id){return;}
    popState($id);
    curState = historyStateMap[$id] ? historyStateMap[$id].state : {$id:0};
    runList(popStateList);
});
if(/\<\<([\d]+)\>\>/.exec(location.hash)){
    setState('replace');
}
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
function merge(o1, o2){
    if(!o2){return o1;}
    for(var key in o2){
        if(o2.hasOwnProperty(key)){
            o1[key] = o2[key];
        }
    }  
    return o1;
}
function setState(method, state, title, url){
    var hash = location.hash.slice(1).replace(/\<\<([\d]+)\>\>/, '') + (state ? '<<' + state.$id + '>>' : '');
    method === 'replace' ? 
        location.replace('#' + hash) :
        (location.hash = hash);
}
