from flask import Response, request
from flask_restful import Resource
import flask_jwt_extended
import json
from models import db, Comment, Post
from views import get_authorized_user_ids

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "Comment" based on the data posted in the body 
        body = request.get_json()
        if not body.get("post_id") or not body.get("text"):
            return Response(json.dumps({"message": "post id and text are both required"}), mimetype="application/json", status=400)
        
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

        new_comment = Comment(
            post_id=body.get("post_id"),
            user_id=self.current_user.id, # must be a valid user_id or will throw an error
            text=body.get("text")
        )
        db.session.add(new_comment)    # issues the insert statement
        db.session.commit()    
        return Response(json.dumps(new_comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "Comment" record where "id"=id
        comment = Comment.query.get(id)
        if not comment:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if comment.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
       
        Comment.query.filter_by(id=id).delete()
        db.session.commit()     
        return Response(json.dumps({"message": "comment was successfully deleted"}), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<int:id>', 
        '/api/comments/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
