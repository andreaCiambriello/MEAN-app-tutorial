import { Post } from "./post.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";

@Injectable({providedIn: 'root'})
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient, private router: Router) {}

    // eseguo una copia dell'array Post con lo spread operator
    getPosts() {
        this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
            .pipe(map((postData) => {
                return postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath
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

    getPost(id: string) {
        return this.http.get<{_id: string, title: string, content: string, imagePath: string}>(
            'http://localhost:3000/api/posts/' + id
            );
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: Post | FormData;
        if(typeof image === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image
            }
        }
        this.http.put('http://localhost:3000/api/posts/' + id, postData)
            .subscribe(response => {
                const updatedPosts = [...this.posts];
                const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
                const post: Post = {
                    id: id,
                    title: title,
                    content: content,
                    imagePath: ''
                }
                updatedPosts[oldPostIndex] = post;
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
            .subscribe((responseData) => {
                const post: Post = {
                    id: responseData.post.id,
                    title: title,
                    content: content,
                    imagePath: responseData.post.imagePath
                };
                // Queste due operazioni, chiamate optimistic updating, ovvero l'aggiornamento dell array con i nuovi post, lo facciamo 
                // dentro il subscribe con la la risposta di successo, in questo modo aggiorniamo l'array in locale solo se abbiamo una
                // response di successo dal backend. Un altro approccio potrebbe essere farlo fuori da questo blocco e quindi 
                // indipendente dal successo o meno della response, e con tempi diversi
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(['/']);
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