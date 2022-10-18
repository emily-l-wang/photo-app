import React from 'react';
import {getHeaders} from './utils';

class LikeButton extends React.Component {  

    constructor(props) {
        super(props);
        this.toggleLike = this.toggleLike.bind(this);
        this.like = this.like.bind(this);
        this.unlike = this.unlike.bind(this);
    }

    toggleLike(ev) {
        if (this.props.likeId) {
            console.log('unlike');
            this.unlike();
        } else {
            console.log('like');
            this.like();
        }
    }

    like() {
        console.log('code to like the post');

        const likeData = {
            "post_id": this.props.postId
        };

        fetch("https://grinsta.herokuapp.com/api/posts/likes/", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(likeData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.props.requeryPost();
        });
    }

    unlike() {
        console.log('code to unlike the post');
        fetch(`https://grinsta.herokuapp.com/api/posts/likes/${this.props.likeId}`, {
            method: "DELETE",
            headers: getHeaders()
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.props.requeryPost();
        });
    }

    render () {
        const likeId = this.props.likeId;
        return (
            <button role="switch"
                className="like" 
                aria-label="Like Button" 
                aria-checked={likeId ? true : false}
                onClick={this.toggleLike}>
                <i className={likeId ? 'fas fa-heart' : 'far fa-heart'}></i>                        
            </button>
        ) 
    }
}

export default LikeButton;
