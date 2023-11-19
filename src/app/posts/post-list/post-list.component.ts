import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostService } from '../post.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
    posts: Post[] = [];
    private postSub: Subscription;
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 2;
    currentPage = 1;
    pageSizeOptions = [1, 2, 5, 10];
    @ViewChild('paginator') paginator: any;
    userIsAuthenticated = false;
    private authListenerSubs: Subscription;

    constructor(public postService: PostService, private authService: AuthService) {}

    ngOnInit() {
      this.isLoading = true;
      this.postService.getPosts(this.postsPerPage, this.currentPage);
      this.postSub = this.postService.getPostsUpdateListener().subscribe(
        (postData: {posts: Post[], postCount: number}) => {
            this.isLoading = false;
            this.totalPosts = postData.postCount;
            this.posts = postData.posts;
        });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(
        isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          }
        );
    }

    onChangedPage(pageData: PageEvent) {
      this.isLoading = true;
      this.currentPage = pageData.pageIndex + 1;
      this.postsPerPage = pageData.pageSize;
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }

    onDelete(postId: string) {
      this.isLoading = true;
      this.postService.deletePost(postId).subscribe(() => {
        if (this.totalPosts - 1 - (this.postsPerPage * (this.currentPage - 1)) <= 0) {
          this.currentPage = (this.currentPage === 1) ? 1 : this.currentPage - 1;
          this.paginator.pageIndex = this.currentPage - 1;
          this.totalPosts = (this.totalPosts === 0) ? 0 : this.totalPosts - 1;
          this.paginator.page.next({
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
            length: this.totalPosts
          });
        }
        this.postService.getPosts(this.postsPerPage, this.currentPage);
      });
    } 

    ngOnDestroy(){
      this.postSub.unsubscribe();
      this.authListenerSubs.unsubscribe();
    }


}