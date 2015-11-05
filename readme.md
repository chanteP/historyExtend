#history兼容性补丁包
主要是SPA用，对不支持history.pushState的情况使用hash处理
	
	//changeState
	history[pushState | replaceState]([state|null, title|null, url|null, onCallback|null, offCallback]);
	//listener
	history[onback | onforward | onstatechange | onpopstate](func);
	//browser
	history[back | forward | reload]
	
