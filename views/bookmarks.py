from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db, Post
import json
from views import get_authorized_user_ids



class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # get all bookmarks owned by the current user
        bookmarks = Bookmark.query.filter(Bookmark.user_id.in_([self.current_user.id])).all()
        bm_json = [bm.to_dict() for bm in bookmarks]
        return Response(json.dumps(bm_json), mimetype="application/json", status=200)

    def post(self):
        # create a new "bookmark" based on the data posted in the body 
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

        bms = Bookmark.query.filter(Bookmark.user_id.in_([self.current_user.id])).all()
        bm_ids = [bm.post_id for bm in bms]
        if temp in bm_ids:
            return Response(json.dumps({"message": "already bookmarked this post"}), mimetype="application/json", status=400)
        
        new_bm = Bookmark(user_id = self.current_user.id, post_id = temp)
        db.session.add(new_bm)
        db.session.commit() 
        
        return Response(json.dumps(new_bm.to_dict()), mimetype="application/json", status=201)

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "bookmark" record where "id"=id
        bm = Bookmark.query.get(id)
        if not bm:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
        if bm.user_id != self.current_user.id:
            return Response(json.dumps({"message": "invalid id"}), mimetype="application/json", status=404)
       
        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()     
        return Response(json.dumps({"message": "bookmark was successfully deleted"}), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<int:id>', 
        '/api/bookmarks/<int:id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
