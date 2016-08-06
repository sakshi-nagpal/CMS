'use strict';
define( [],

    function(){

        return ['Storage',[
            function(){

                var addSessionStorageItem, getSessionStorageItem, deleteAllSessionStorageItems,
                    addLocalStorageItem, getLocalStorageItem, deleteAllLocalStorageItems;

                this.isSessionStorageAvailable = function () {
                    if(window.sessionStorage)
                        return true;
                    else
                        return false;
                };

                this.isLocalStorageAvailable = function () {
                    if(window.localStorage)
                        return true;
                    else
                        return false;
                };

                var addStorageItem = function(key,value,isArray,storage){

                    if(isArray){
                        value = value.toString();
                    }else{
                        if(typeof value === 'object') //change JSON to String
                            value = JSON.stringify(value);
                    }
                    try {
                        storage.setItem(key,value);
                    } catch(e) {
                        throw new Error(e.message); // in case of QUOTA_EXCEEDED_ERR
                    }

                };


                var getStorageItem = function(key,storage,isArray){
                    var ret;
                    var value = storage.getItem(key);

                    if(isArray)
                        ret = value.split(',');
                    else {
                        try {
                            ret = JSON.parse(value); // check and convert to JSON
                        }catch(e){
                            ret = value; // else return the same value
                        }
                    }

                    return ret;
                };

                var deleteStorageItems = function(key,storage){
                    if(key){
                        storage.removeItem(key);
                    }else{
                        storage.clear();
                    }
                };

                if(this.isSessionStorageAvailable){

                    addSessionStorageItem = function(key,value,isArray){
                      addStorageItem(key,value,isArray,sessionStorage);

                    };

                    getSessionStorageItem = function(key,isArray){
                       return getStorageItem(key,sessionStorage,isArray);
                    };

                    deleteAllSessionStorageItems = function(key){
                        deleteStorageItems(key,sessionStorage);
                    };


                }else{ // set all to function returning null if no storage available
                    addSessionStorageItem = getSessionStorageItem = deleteAllSessionStorageItems = function(){
                        return null;
                    };
                }

                if(this.isLocalStorageAvailable){
                    addLocalStorageItem = function(key,value,isArray){
                        addStorageItem(key,value,isArray,localStorage);
                    };

                    getLocalStorageItem = function(key,isArray){
                        return getStorageItem(key,localStorage,isArray);
                    };

                    deleteAllLocalStorageItems = function(key){
                        deleteStorageItems(key,localStorage);
                    };
                }else{ // set all to function returning null if no storage available 
                    addLocalStorageItem = getLocalStorageItem = deleteAllLocalStorageItems = function(){
                        return null;
                    };
                }

                this.setSessionStorageItem = addSessionStorageItem;
                this.getSessionStorageItem = getSessionStorageItem;
                this.clearSessionStorage = deleteAllSessionStorageItems;

                this.setLocalStorageItem = addLocalStorageItem;
                this.getLocalStorageItem = getLocalStorageItem;
                this.clearLocalStorage = deleteAllLocalStorageItems;

            }
        ]];

    }


);
