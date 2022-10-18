import React from 'react';
import BookmarkButton from './BookmarkButton';
import LikeButton from './LikeButton';
import AddComment from './AddComment';
import {getHeaders} from './utils';

class Post extends React.Component {  

    constructor(props) {
        super(props);
        this.state = {
            post: this.props.model
        }

        this.requeryPost = this.requeryPost.bind(this);
    }

    requeryPost() {
        fetch(`/api/posts/${this.state.post.id}`, {
                headers: getHeaders()
            })
            .then(response => response.json())
            .then(data => {
                this.setState({ 
                    post: data
                });
            });
    }
    
    render () {
        const post = this.state.post;
        const numComments = this.state.post.comments.length;
        const latestComment = this.state.post.comments[numComments-1];

        if (!post) {
            return (
                <div></div>  
            );
        }
        
        return (
            <section className="card">
                <div className="header">
                    <h3>{ post.user.username }</h3>
                    <i className="fa fa-dots"></i>
                </div>
                
                <img 
                    src={ post.image_url } 
                    alt={'Image posted by ' +  post.user.username } 
                    width="300" 
                    height="300" />
                
                <div className="info">
                    <div className="buttons">
                        <div>
                            <LikeButton 
                                postId={post.id} 
                                likeId={post.current_user_like_id}
                                requeryPost={this.requeryPost} />
                            <i className="far fa-comment"> </i>
                            <i className="far fa-paper-plane"> </i>
                        </div>

                        
                        
                        <div>
                            <BookmarkButton 
                                postId={post.id} 
                                bookmarkId={post.current_user_bookmark_id}
                                requeryPost={this.requeryPost} /> 
                        </div>
                    

                    </div>

                    <p className="likes">
                            <strong>
                                {post.likes.length} 
                                {post.likes.length === 1 ? " like" : " likes"}
                            </strong> 
                    </p>
                    
                    <div className="caption">
                        <p> <strong> {post.user.username} </strong> 
                            { post.caption }</p>
                        <p className = "timestamp" >  {post.display_time} </p>
                    </div>

                    

                    {numComments > 1 ? 
                            <button className="link" aria-label="View All Comments" >
                                View all {numComments} comments
                            </button>
                            : 
                            ""
                    }
                    <div className = "comments" >
                        { 
                        numComments > 0 ? 
                            <div>
                                <p>
                                    <strong> {latestComment.user.username} </strong> 
                                    {latestComment.text} 
                                </p>
                                <p className = "timestamp" >  {latestComment.display_time} </p>
                            </div> 
                        : 
                        ""
                        }
                                
                        
                    </div>

                    
                     
                </div>
                <AddComment 
                    postId={post.id} 
                    requeryPost={this.requeryPost} />  
            </section> 
        );     
    }
}

export default Post;