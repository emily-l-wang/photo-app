const toggleFollow = ev => {
    const elem = ev.currentTarget;
    if (elem.innerHTML === 'follow') {
        createFollower(elem.dataset.userId, elem);
    }
    else {
        deleteFollower(elem.dataset.followingId, elem);
    } 
}

const toggleLike = ev => {
    const elem = ev.currentTarget;
    if (elem.getAttribute('aria-checked') === 'false') {
        createLike(elem.dataset.postId, elem);
    }
    else {
        deleteLike(elem.dataset.likeId, elem);
    }  
}

const toggleBookmark = ev => {
    const elem = ev.currentTarget;
    if (elem.getAttribute('aria-checked') === 'false') {
        createBookmark(elem.dataset.postId, elem);
    }
    else {
        deleteBookmark(elem.dataset.bookmarkId, elem);
    }    
}

const postComment = ev => {
    const elem = ev.currentTarget;
    const postId = elem.dataset.postId;
    
    const postData = {
        "post_id": postId,
        "text": document.getElementById(postId).value
    };
    
    fetch("/api/comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayPosts(postId);
        });
}

const genModal = post => {
    let commentBody = '';

    for (com of post.comments) {
        commentBody += `
            <div class = "modal-comment">
                <img class = "circle" src=${com.user.thumb_url}  alt="picture posted by ${com.user.username}"/> 
                <div class = "mid">
                    <div class = "comment">
                        <span class = "named">${com.user.username}</span> ${com.text} 
                    </div>
                    <p class = "timestamp" >  ${com.display_time} </p>
                </div>
                <button class="like-comment">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        `
    }
    const modalBody = `
        <section class="modal">
            <button class="close"
                    data-open-id="open${post.id}"
                    aria-label="Close the modal window" 
                    onclick="closeModal(event);">
                x
            </button>
            <div class="modal-body">
                <img class = "modal-img" src=${post.image_url} alt="picture posted by ${post.user.username}" /> 
                <div class = "modal-right"> 
                    <section class = "modal-profile" > 
                        <img class = "circle" src=${post.user.thumb_url} alt="profile pic for ${post.user.username}"/> 
                        <h1> ${post.user.username} </h1>
                    </section>  
                    
                    ${commentBody}
                </div>
            </div>
        </section>
    `
    document.querySelector('.modal-bg').innerHTML = modalBody;
}

const openModal = ev => {
    const url = `/api/posts/${ev.currentTarget.dataset.postId}` 
    fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        genModal(data);
        const modalElement = document.querySelector('.modal-bg');
        console.log('open!');
        modalElement.classList.remove('hidden');
        modalElement.setAttribute('aria-hidden', 'false');
        document.querySelector('.close').focus();
    });
}

const closeModal = ev => {
    const modalElement = document.querySelector('.modal-bg');
    console.log('close!');
    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    const openId = `#${ev.currentTarget.dataset.openId}`
    document.querySelector(openId).focus();
};

const createFollower = (userId, elem) => {
    const postData = {
        "user_id": userId
    };
    
    fetch("/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.setAttribute('aria-checked', 'true')
            elem.innerHTML = 'unfollow';
            elem.classList.add('unfollow');
            elem.classList.remove('follow');
            // in order to make unfollowing possible
            elem.setAttribute('data-following-id', data.id);
        });
}

const deleteFollower = (followingId, elem) => {
    const deleteurl = `/api/following/${followingId}`;
    fetch(deleteurl, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'false')
        elem.innerHTML = 'follow';
        elem.classList.add('follow');
        elem.classList.remove('unfollow');
    });
}

const createLike = (postId, elem) => {

    const postData = {
        "post_id": postId
    };
    
    fetch("/api/posts/likes/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // elem.setAttribute('aria-checked', 'true')
            // elem.innerHTML = '<i class="fas fa-heart fa-red"></i>'
            displayPosts();
        });
}

const deleteLike = (likeId, elem) => {
    const deleteurl = `/api/posts/likes/${likeId}`;
    fetch(deleteurl, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // elem.setAttribute('aria-checked', 'false');
        // elem.innerHTML = '<i class="far fa-heart"></i>';
        displayPosts();
    });
}

const createBookmark = (postId, elem) => {

    const postData = {
        "post_id": postId
    };
    
    fetch("/api/bookmarks/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // elem.setAttribute('aria-checked', 'true')
            // elem.innerHTML = '<i class="fas fa-bookmark"></i>'
            displayPosts();
        });
}

const deleteBookmark = (bookmarkId, elem) => {
    const deleteurl = `/api/bookmarks/${bookmarkId}`;
    fetch(deleteurl, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // elem.setAttribute('aria-checked', 'false');
        // elem.innerHTML = '<i class="far fa-bookmark"></i>';
        displayPosts();
    });
}

const getCookie = key => {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

const userSuggestion2Html = user => {
    return `
    <section class = "reco-person"> 
        <div class = "not-follow">
            <img class = "circle" src=${user.thumb_url}  alt="picture posted by ${user.username}"/> 
            <ul>
                <li>  ${user.username}  </li>
                <li> <a> suggested for you </a> </li>
            </ul>
        </div>
        <div > 
            <button class="follow" 
                    aria-label="Follow"
                    aria-checked="false"
                    data-user-id="${user.id}" 
                    onclick="toggleFollow(event);">follow</button>
        </div>
    </section>
    `;
};

const post2Html = post => {
    const numLikes = post.likes.length;
    const numComments = post.comments.length;

    let commentText = '';

    if (numComments > 1) {
        commentText = `
            <button class="open" 
                aria-label="View All Comments"
                data-post-id=${post.id}
                id="open${post.id}"
                onclick="openModal(event);">
                View all ${numComments} comments
            </button>
        `;
    }
    if (numComments > 0) {
        const comment = post.comments[post.comments.length-1];
        commentText += `
            <div class = "comment">
                <span class = "named"> ${comment.user.username} 
                </span> ${comment.text} 
            </div>
            <p class = "timestamp" >  ${comment.display_time} </p>
        `;
    }

    let likeIcon = "far fa-heart";
    let bookmarkIcon = "far fa-bookmark";
    let likeChecked = "false";
    let bookmarkChecked = "false";

    if (post.current_user_like_id) {
        likeIcon = "fas fa-heart fa-red";
        likeChecked = "true";
    }

    if (post.current_user_bookmark_id) {
        bookmarkIcon = "fas fa-bookmark";
        bookmarkChecked = "true";
    }

    return `
    <div class = "card">
        <div class = "card-header">
            <h1> ${post.user.username} </h1>
            <i class="fas fa-ellipsis-h"></i>
        </div>

        <div>
            <img class = "card-img" src=${post.image_url} alt="picture posted by ${post.user.username}" /> 
        </div>

        <div class = "card-info">
            <div class = "top-bar" >
                <div class = "left-top-bar">
                    <button class="like" 
                        aria-label="Like"
                        aria-checked=${likeChecked}
                        data-post-id=${post.id}
                        data-like-id=${post.current_user_like_id}
                        onclick="toggleLike(event);">
                        <i class="${likeIcon}"></i>
                    </button>
                    <button>
                        <i class="far fa-comment"></i>
                    </button>
                    <button>
                        <i class="far fa-paper-plane"></i>
                    </button>
                </div> 
                <div class = "right-top-bar">
                    <button class="bookmark" 
                        aria-label="Bookmark"
                        aria-checked=${bookmarkChecked}
                        data-post-id=${post.id}
                        data-bookmark-id=${post.current_user_bookmark_id}
                        onclick="toggleBookmark(event);">
                        <i class="${bookmarkIcon}"></i>
                    </button>
                </div> 
            </div>

            <div class = "likes" >
                ${numLikes} likes
            </div>

            <div class = "caption" >
                <span class = "named"> 
                    ${post.user.username}
                </span> 
                ${post.caption}
                <p class = "timestamp" >  ${post.display_time} </p>
            </div>


            <div class = "comments" >
                ${commentText}
            </div>
        </div>

        <div class = "card-interact">
            <div class = "interact-comment">
                <input class="comment-box" id="${post.id}" type="text" placeholder="Add a comment...">
            </div>
            <button class="post" 
                    aria-label="Post"
                    data-post-id="${post.id}" 
                    onclick="postComment(event);">
                    Post
            </button>
        </div>
    </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

const displaySuggestions = () => {
    fetch('/api/suggestions')
        .then(response => response.json())
        .then(users => {
            const html = users.map(userSuggestion2Html).join('\n');
            const appended = `
                <h2> Suggestions for you </h2> 
                ${html}
            `;
            document.querySelector('.recos').innerHTML = appended;
        })
};

const displayPosts = id => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
            if (id) {
                document.getElementById(id).focus();
            }
        })
};

const displayUserProfile = () => {
    fetch('/api/profile')
        .then(response => response.json())
        .then(profile => {
            document.querySelector('.profile').innerHTML = `
                <img class = "circle" src=${profile.thumb_url} width=60 height=60 alt="profile pic for ${profile.username}"/> 
                <h1> ${profile.username} </h1>
            `;
        })
};

const initPage = () => {
    displayStories();
    displaySuggestions();
    displayPosts();
    displayUserProfile();
};

initPage();

document.addEventListener('focus', function(event) {
    const modalElement = document.querySelector('.modal-bg');
    console.log('focus');
    if (modalElement.getAttribute('aria-hidden') === 'false' && !modalElement.contains(event.target)) {
        console.log('back to top!');
        event.stopPropagation();
        document.querySelector('.close').focus();
    }
}, true);
