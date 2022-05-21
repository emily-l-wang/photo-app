from flask import Response, request
from flask_restful import Resource
import flask_jwt_extended
from models import Post, db, Following
from views import get_authorized_user_ids

import json

def get_path():
    return request.host_url + 'api/posts/'

class PostListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def get(self):
        user_ids = get_authorized_user_ids(self.current_user)
        args = request.args
        lim = args.get("limit") or 10
        try:
            lim = int(lim)
        except:
            return Response(json.dumps({"message": "limit parameter should be an int"}), mimetype="application/json", status=400)
        if lim > 50:
            return Response(json.dumps({"message": "cannot get more than 50 results"}), mimetype="application/json", status=400)
        posts = Post.query.filter(Post.user_id.in_(user_ids)).limit(lim).all()
        data = [
            post.to_dict(user=self.current_user) for post in posts
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new post based on the data posted in the body 
        body = request.get_json()
        if not body.get("image_url"):
            return Response(json.dumps({"message": "image url is required"}), mimetype="application/json", status=400)
        new_post = Post(
            image_url=body.get("image_url"),
            user_id=self.current_user.id, # must be a valid user_id or will throw an error
            caption=body.get("caption"),
            alt_text=body.get("alt_text")
        )
        db.session.add(new_post)    # issues the insert statement
        db.session.commit()    
        return Response(json.dumps(new_post.to_dict()), mimetype="application/json", status=201)
        
class PostDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
        
    @flask_jwt_extended.jwt_required()
    def patch(self, id):
        # update post based on the data posted in the body 
        body = request.get_json()

        post = Post.query.get(id)
        if not post:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if post.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        
        if body.get("image_url"):
            post.image_url = body.get("image_url")
        if body.get("caption"):
            post.caption = body.get("caption")
        if body.get("alt_text"):
            post.alt_text = body.get("alt_text")
        db.session.commit()    
        return Response(json.dumps(post.to_dict()), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete post where "id"=id
        post = Post.query.get(id)
        if not post:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if post.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
       
        Post.query.filter_by(id=id).delete()
        db.session.commit()     
        return Response(json.dumps({"message": "post id was successfully deleted"}), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def get(self, id):
        # get the post based on the id
        post = Post.query.get(id)
        if not post:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        user_ids = get_authorized_user_ids(self.current_user)
        if post.user_id not in user_ids:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)

        return Response(json.dumps(post.to_dict(user=self.current_user)), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(
        PostListEndpoint, 
        '/api/posts', '/api/posts/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        PostDetailEndpoint, 
        '/api/posts/<int:id>', '/api/posts/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )