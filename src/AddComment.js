import React from 'react';
import {getHeaders} from './utils';

class AddComment extends React.Component {  

    constructor(props) {
        super(props);
        this.postComment = this.postComment.bind(this);
        this.state = {
            value: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.textInput = React.createRef();
    }
    
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.postComment();
        }
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    postComment() {
        const postData = {
            "post_id": this.props.postId,
            "text": this.state.value
        };
        
        fetch("https://grinsta.herokuapp.com/api/comments/", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(postData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.props.requeryPost();
                this.setState({value: ""});
                this.textInput.current.focus();
            });
    }

    render () {
        return (
            <div className = "add-comment">
                <input className="input-holder" 
                       onChange={this.handleChange} 
                       value={this.state.value} 
                       id={this.props.postId} 
                       ref={this.textInput}
                       type="text" 
                       placeholder="Add a comment..." />
                <button className="link"
                        aria-label="Post"
                        data-post-id={this.props.postId} 
                        onClick={this.postComment}
                        onKeyDown={this.handleKeyDown}>
                        Post
                </button>
            </div>
        ) 
    }
}

export default AddComment;
