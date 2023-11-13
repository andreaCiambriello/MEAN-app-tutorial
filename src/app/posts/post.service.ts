import { Post } from "./post.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient) {}

    // eseguo una copia dell'array Post con lo spread operator
    getPosts() {
        this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
            .pipe(map((postData) => {
                return postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id
                    };
                });
            }))
            .subscribe((transformedPost) => {
                this.posts = transformedPost;
                this.postsUpdated.next([...this.posts]);
        });
    }

    getPostsUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    addPost(title: string, content: string) {
        const post: Post = { id: null, title: title, content: content };
        this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
            .subscribe((responseData) => {
                const id = responseData.postId;
                post.id = id;
                // Queste due operazioni, chiamate optimistic updating, ovvero l'aggiornamento dell array con i nuovi post, lo facciamo 
                // dentro il subscribe con la la risposta di successo, in questo modo aggiorniamo l'array in locale solo se abbiamo una
                // response di successo dal backend. Un altro approccio potrebbe essere farlo fuori da questo blocco e quindi 
                // indipendente dal successo o meno della response, e con tempi diversi
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]);
            });
    }

    deletePost(postId: string) {
        this.http.delete('http://localhost:3000/api/posts/' + postId)
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id !== postId);
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
            });
    }
}