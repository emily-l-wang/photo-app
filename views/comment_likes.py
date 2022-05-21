from flask import Response, request
from flask_restful import Resource
import flask_jwt_extended
from models import LikeComment, db, Comment
import json
from views import get_authorized_user_ids

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        body = request.get_json()
        if not body.get("comment_id"):
            return Response(json.dumps({"message": "comment id is required"}), mimetype="application/json", status=400)
        try:
            temp = int(body.get("comment_id"))
        except: 
            return Response(json.dumps({"message": "comment id must be an integer"}), mimetype="application/json", status=400)
        
        comment = Comment.query.get(temp)
        if not comment:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        user_ids = get_authorized_user_ids(self.current_user)
        if comment.user_id not in user_ids:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)

        likes = LikeComment.query.filter(LikeComment.user_id.in_([self.current_user.id])).all()
        like_ids = [like.comment_id for like in likes]
        if temp in like_ids:
            return Response(json.dumps({"message": "already liked this comment"}), mimetype="application/json", status=400)
        
        new_like = LikeComment(user_id = self.current_user.id, comment_id = temp)
        db.session.add(new_like)
        db.session.commit() 
        
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        like = LikeComment.query.get(id)
        if not like:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if like.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
       
        LikeComment.query.filter_by(id=id).delete()
        db.session.commit()     
        return Response(json.dumps({"message": "like was successfully deleted"}), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/comments/likes', 
        '/api/comments/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/comments/likes/<int:id>', 
        '/api/comments/likes/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
