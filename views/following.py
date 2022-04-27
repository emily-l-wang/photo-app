from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # return all of the "following" records that the current user is following
        
        following = Following.query.filter(Following.user_id.in_([self.current_user.id])).all()
        following_json = [fol.to_dict_following() for fol in following]
        return Response(json.dumps(following_json), mimetype="application/json", status=200)

    def post(self):
        # create a new "following" record based on the data posted in the body 
        body = request.get_json()
        if not body.get("user_id"):
            return Response(json.dumps({"message": "user id is required"}), mimetype="application/json", status=400)
        try:
            temp = int(body.get("user_id"))
        except: 
            return Response(json.dumps({"message": "user id must be an integer"}), mimetype="application/json", status=400)
        following = Following.query.filter(Following.user_id.in_([self.current_user.id])).all()
        following_ids = [fol.following_id for fol in following]
        if temp in following_ids:
            return Response(json.dumps({"message": "already following this user"}), mimetype="application/json", status=400)
        fol = Following.query.get(temp)
        if not fol:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)

        new_following = Following(user_id = self.current_user.id, following_id = temp)
        db.session.add(new_following)
        db.session.commit() 
       
        return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "following" record where "id"=id
        fol = Following.query.get(id)
        if not fol:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if fol.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)

        try:
            temp = int(id)
        except: 
            return Response(json.dumps({"message": "id must be an integer"}), mimetype="application/json", status=400)
        fol = Following.query.get(temp)
        if not fol:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        Following.query.filter_by(id=id).delete()
        db.session.commit()    
        return Response(json.dumps({"message": "following record was successfully deleted"}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<int:id>', 
        '/api/following/<int:id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
