var ItemList = Vue.extend({
	template:'#itemlist',
	name:'item-list',
	data:function(){
		var isMounted = !this.$root._isMounted;
		return {
			transition:'slide-left',
			displayedPage: isMounted ? Number(this.$store.state.route.params.page) || 1:-1,
			displayedItems: isMounted ? Number(this.$store.state.items):[]
		}
	},
    props:{
    	type:String
    },
    computed:{
    	page:function(){
    		return Number(this.$store.state.route.params.page)||1
    	},
    	maxPage:function(){
    		
            return Math.ceil(this.$store.state.lists[this.type].length/this.$store.state.itemsPerPage)
           
    	},
    	hasMore:function(){
    		return this.page<this.maxPage?true:false
    	}
    },
    beforeMount:function(){
    	
    	this.loadItems();
    },
    methods:{
    	loadItems:function(to=this.page,form=-1){
    		
    		this.$store.dispatch('FETCH_LIST_DATA',{
    			type:this.type
    		}).then(()=>{
    			console.log(this.$store.state.items);
    			this.displayedItems = this.$store.state.items;
    			console.log(this.displayedItems);
    		})

    	}
    }
})

function createComponent(type){
	return {
		name:`${type}-stories-view`,
		preFetch(store) {
			console.log('preFetch');
            return store.dispatch('FETCH_LIST_DATA', { type })
        },
		render: function (createElement) {
            return createElement(ItemList, {props: {type: type}})
        }
    }
}
var router = new VueRouter({
  routes: [
    // 动态路径参数 以冒号开头
    { path: '/top/:page(\\d+)?', component: createComponent('top') },
    { path:'/', redirect: '/top'}
  ]
})
var store = new Vuex.Store({
  state: {
    items: {},
    users: {},
    itemsPerPage: 20,
    activeType:null,
    lists:{
    	top: [],
        new: [],
        show: [],
        ask: [],
        job: []
    }
  },
  mutations: {
    SET_IN_LISTS:function(state,{data,type}){	
    	console.log('SET_IN_LISTS');
    	state.lists[type]=data;
    },
    SET_IN_ITEMS:function(state,{data}){
    	state.items = data;
    	console.log(state.items);
    	
    },
    SET_ACTIVE_TYPE:function(state,{type}){
    	state.activeType = type;
    }
  },
  actions: {
  	FETCH_LIST_DATA:function({commit,dispatch,state},{type}){
  		commit('SET_ACTIVE_TYPE', { type })
        fetchIdsByType(type)
        .then(ids=>{commit('SET_IN_LISTS',{data:ids,type:type})})
        .then(()=>{dispatch('ENSURE_ACTIVE_ITEMS')})

  	},
  	ENSURE_ACTIVE_ITEMS: ({ dispatch, getters }) => {
  		console.log(getters.ACTIVE_IDS);
            return dispatch('FETCH_ITEMS', {
                ids: getters.ACTIVE_IDS
            })
    },
  	FETCH_ITEMS:function({commit,dispatch,state,getters},{data}){
  		fetchItems(data)
  		.then(items=>{commit('SET_IN_ITEMS',{data:items})});
  		console.log(getters.ACTIVE_IDS);
  	}
  },
  getters:{
  	ACTIVE_IDS:function (state) {
  		var page = state.route.params.page;
  		var per = state.itemsPerPage;
  		var lists = state.lists[state.activeType].slice((page-1)*per,page*per);
  		return lists;
  		
  	}
  }
}) 
sync( store, router );

const app = new Vue({
  router,
  store,
}).$mount('#app');