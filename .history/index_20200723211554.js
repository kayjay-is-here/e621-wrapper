// TODO 'use strict';

/**
 * @module e621
 * @author kjl3080
 * @license MIT
 * 
 * @TODO Add POST, PUT, DELETE, and PATCH controllers
 * @TODO access comments
 * @TODO once done, make @furtheinterested/e621-wrapper unstable builds only and update and undeprecate e621-wrapper
 */
const request = require('request');
//const { response } = require('express');
class e621  { // Wrapper can be initialized using (const e621Wrapper = new e621(...params);)
    
    // Initialization
    constructor(user_agent, username, api_key, page_limit) {
        this.user_agent = user_agent;
        this.username = username; // Username and api_key required for all 
        this.api_key = api_key; // REST requests for some reason
        this.page_limit = page_limit // 50 * page_limit = entry limit
    }


    // Static functions 

    /**@param {id} - static function that returns a url based on page id */
    static generatePageURI(id) {
        return `https://e621.net/posts/${id}`
    }
    /**@param {id} - static function that returns a url based on user id */
    static generateUserURI(id) {
        return `https://e621.net/users/${id}`
    }

    // Get and Set Functions
    /**@param {string} - optional setter for blacklist tags */
    set blacklist(blacklist) { //man i wish casting was in javascript polymorphism is cool
        this.blacklist = typeof blacklist == string ? blacklist : blacklist.split(' ')
    }
    
    
    
    // Class methods
    /**
     * Returns a User object based on ID (WARNING: e621's handling of this is broken)
     * @param {string} id - the ID of the user.
     */
    getUserById(id) {
        //console.warn("Currently, due to API renovation, e621's handling of users is broken.")
        request.get(`https://e621.net/users/${id}.json`,
        {
            headers: {
                'User-Agent': this.user_agent,
                'login': this.username,
                'api_key': this.api_key
            }
        }, (err, res, body) => {
            if(err) throw err;
            const status = res.statusCode;
            if (status >= 400) {
                throw new Error("Error during GET Request: Status code " + status);
            }
            const data = JSON.parse(body)
            return data
        })        
    }
    /**
     * Returns a User object based on name (WARNING: e621's handling of this is broken)
     * @param {string} name - the name of the user 
     */
    getUserByName(name) {
        //console.warn("Currently, due to API renovation, e621's handling of users is broken.")
        request.get(`https://e621.net/users/${name}.json`,
        {
            headers: {
                'User-Agent': this.user_agent,
                'login': this.username,
                'api_key': this.api_key
            }
        }, (err, res, body) => {
            if(err) throw err;
            const status = res.statusCode;
            if (status >= 400) {
                throw new Error("Error during GET Request: Status code " + status);
            }
            const data = JSON.parse(body)
            return data;
        })        
    }
    
    /**
     * Returns search results in an Array containing posts.
     * @param {string || array} tags - Filter by tags
     * @param {string} rating - Filter by rating (Optional)
     * @param {...string} otherOptions - Other options, format in <option=value, option2=value>, etc (optional). View e621's API for help.
     * 
     */
    getSearchResults(tags, rating, ...otherOptions) { /** @TODO add ascending/desending and stuff */
        if (!(typeof tags == 'string')) {
            tags = tags.join(' ')
        }
        if(typeof rating == 'undefined')  {
            rating = ''
        } else {
            rating = "&rating=" + rating
        }// Yes, javascript is stupid
        const blacklist = this.blacklist ? ' ' + this.blacklist.join(' ') : ''
        request.get(`https://e621.net/posts.json?tags=${encodeURIComponent(tags+blacklist)}&limit=${this.page_limit*50}${otherOptions.length > 0 ? "&"+otherOptions.join('&') :''}`,
        {
            headers: {
                'User-Agent': this.user_agent,
                'login': this.username,
                'api_key': this.api_key
            }
        }, (err, res, body) => {
            if (err) throw err;
            const status = res.statusCode;
            if (status >= 400) {
                throw new Error("Error during GET Request: Status code " + status);
            }
            if(!body) {
                throw new Error("No JSON recieved in GET Request.");
            }
            const result = JSON.stringify(body).posts.filter((post)=> {
                return post.rating === rating;
            })
            return result;
        })
    }
}




module.exports = e621;