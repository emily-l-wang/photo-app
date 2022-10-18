import React from 'react';
import Suggestion from './Suggestion';
import {getHeaders} from './utils';

class Suggestions extends React.Component {  
    constructor(props) {
        super(props);
        this.state = { suggestions: [] };
        this.fetchSug = this.fetchSug.bind(this);
    }

    componentDidMount() {
        this.fetchSug();
    }

    fetchSug() {
        fetch('/api/suggestions', {
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(users => {
                this.setState({ suggestions: users });
            })
    }

    render () {
        return (
            <div className="suggestions">
                <p className="suggestion-text">Suggestions for you</p>
                {
                    this.state.suggestions.map(user => {
                        return (
                            <Suggestion model={user} 
                                        key={'user-' + user.id} />
                        )
                    })
                }
            </div>
        )     
    }
}

export default Suggestions;