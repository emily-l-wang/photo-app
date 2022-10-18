import React from 'react';
import {getHeaders} from './utils';

class FollowButton extends React.Component {  

    constructor(props) {
        super(props);
        this.toggleFollow = this.toggleFollow.bind(this);
        this.follow = this.follow.bind(this);
        this.unfollow = this.unfollow.bind(this);
    }

    toggleFollow(ev) {
        if (this.props.followingId) {
            console.log('unfollow');
            this.unfollow();
        } else {
            console.log('follow');
            this.follow();
        }
    }

    follow() {
        const followData = {
            "user_id": this.props.userId
        };

        fetch("/api/following/", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(followData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.props.refreshSug(data.id);
        });
    }

    unfollow() {
        fetch(`/api/following/${this.props.followingId}`, {
            method: "DELETE",
            headers: getHeaders()
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.props.refreshSug(null);
        });
    }

    render () {
        const followingId = this.props.followingId;
        return (
            <button role="switch"
                className="link following" 
                aria-label="Follow Button" 
                aria-checked={followingId ? true : false}
                onClick={this.toggleFollow}>
                {followingId ? "unfollow" : "follow"}                        
            </button>
        ) 
    }
}

export default FollowButton;