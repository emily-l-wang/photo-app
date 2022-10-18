import React from 'react';
import FollowButton from './FollowButton';

class Suggestion extends React.Component {  

    constructor(props) {
        super(props);
        this.state = {
            suggestion: this.props.model,
            followingId: null
        }
        this.refreshSug = this.refreshSug.bind(this);
    }

    refreshSug(id) {
        this.setState({ 
            followingId: id
        });
    }
    
    render () {
        const user = this.state.suggestion;
        if (!user) {
            return (
                <div></div>  
            );
        }
        return (
            <section> 
                <img className = "pic" src= {user.thumb_url}  alt={"picture posted by" + user.username}/> 
                <div>
                    <p>
                        {user.username}
                    </p>
                    <p> 
                        suggested for you 
                    </p>
                </div>
                <div>
                    <FollowButton userId={user.id}
                                  followingId={this.state.followingId}
                                  refreshSug={this.refreshSug}/>
                </div>
            </section>
        );     
    }
}

export default Suggestion;