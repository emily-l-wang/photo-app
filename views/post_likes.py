from flask import Response, request
from flask_restful import Resource
import flask_jwt_extended
from models import LikePost, db, Post
import json
from views import get_authorized_user_ids

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "like_post" based on the data posted in the body 
        body = request.get_json()
        if not body.get("post_id"):
            return Response(json.dumps({"message": "post id is required"}), mimetype="application/json", status=400)
        try:
            temp = int(body.get("post_id"))
        except: 
            return Response(json.dumps({"message": "post id must be an integer"}), mimetype="application/json", status=400)
        
        post = Post.query.get(temp)
        if not post:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        user_ids = get_authorized_user_ids(self.current_user)
        if post.user_id not in user_ids:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)

        likes = LikePost.query.filter(LikePost.user_id.in_([self.current_user.id])).all()
        like_ids = [like.post_id for like in likes]
        if temp in like_ids:
            return Response(json.dumps({"message": "already liked this post"}), mimetype="application/json", status=400)
        
        new_like = LikePost(user_id = self.current_user.id, post_id = temp)
        db.session.add(new_like)
        db.session.commit() 
        
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "like_post" where "id"=id
        like = LikePost.query.get(id)
        if not like:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if like.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
       
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()     
        return Response(json.dumps({"message": "like was successfully deleted"}), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/likes', 
        '/api/posts/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/likes/<int:id>', 
        '/api/posts/likes/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
