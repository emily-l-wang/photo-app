import React from 'react';
import NavBar from './NavBar';
import Profile from './Profile';
import Stories from './Stories';
import Suggestions from './Suggestions';
import Posts from './Posts';
import {getHeaders} from './utils';

class App extends React.Component {  

    constructor(props) {
        super(props);
        this.state = { profile: {} };
        this.getProfile = this.getProfile.bind(this);
    }

    componentDidMount() {
        this.getProfile();
    }

    getProfile() {
        fetch('/api/profile', {
            headers: getHeaders()
        })
        .then(response => response.json())
        .then(profile => {
            this.setState({ profile: profile});
        });
    }

    render () {
        const profile = this.state.profile;
        return (
            <div>
                <NavBar title="Photo App" username={profile.username}/>
                <aside>
                    <Profile username={profile.username} 
                             thumb_url={profile.thumb_url} />
                    <Suggestions />
                </aside>

                <main className="content">
                    <Stories />
                    <Posts />
                </main>
            </div>
        );
    }
}

export default App;