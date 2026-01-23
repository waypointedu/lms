"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  DiscussionPost,
  DiscussionThread,
  createPost,
  createThread,
  getPostsForThread,
  getThreadsForItem,
} from "@/lib/discussions";

type DiscussionPanelProps = {
  courseId: string;
  weekId: string | null;
  contentItemId: string;
};

type LoadState = "idle" | "loading" | "error";

export function DiscussionPanel({
  courseId,
  weekId,
  contentItemId,
}: DiscussionPanelProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [newReplyBody, setNewReplyBody] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const activeThread = threads[0] ?? null;

  const reload = async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient.auth.getUser();

      if (error || !data.user) {
        throw new Error("Unable to load your session.");
      }

      setUserId(data.user.id);

      const fetchedThreads = await getThreadsForItem(
        supabaseClient,
        contentItemId,
      );
      setThreads(fetchedThreads);

      if (fetchedThreads[0]) {
        const fetchedPosts = await getPostsForThread(
          supabaseClient,
          fetchedThreads[0].id,
        );
        setPosts(fetchedPosts);
      } else {
        setPosts([]);
      }

      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load discussion.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    if (!contentItemId) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentItemId]);

  const groupedPosts = useMemo(() => {
    const rootPosts = posts.filter((post) => !post.parent_post_id);
    const replies = posts.filter((post) => post.parent_post_id);
    const replyMap = new Map<string, DiscussionPost[]>();
    replies.forEach((reply) => {
      const list = replyMap.get(reply.parent_post_id as string) ?? [];
      list.push(reply);
      replyMap.set(reply.parent_post_id as string, list);
    });
    return { rootPosts, replyMap };
  }, [posts]);

  const handleThreadSubmit = async () => {
    if (!userId) {
      setErrorMessage("Unable to determine your user id.");
      return;
    }

    if (!newThreadTitle.trim() || !newThreadBody.trim()) {
      setErrorMessage("Add a title and a starter post.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      await createThread(supabaseClient, {
        courseId,
        weekId,
        contentItemId,
        title: newThreadTitle.trim(),
        createdBy: userId,
      });

      const threadsAfter = await getThreadsForItem(
        supabaseClient,
        contentItemId,
      );

      const createdThread = threadsAfter[threadsAfter.length - 1];

      if (createdThread) {
        await createPost(supabaseClient, {
          threadId: createdThread.id,
          body: newThreadBody.trim(),
          createdBy: userId,
        });
      }

      setNewThreadTitle("");
      setNewThreadBody("");
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create thread.";
      setErrorMessage(message);
    }
  };

  const handleReplySubmit = async () => {
    if (!userId || !activeThread) {
      setErrorMessage("Unable to post a reply.");
      return;
    }

    if (!newReplyBody.trim()) {
      setErrorMessage("Reply text is required.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      await createPost(supabaseClient, {
        threadId: activeThread.id,
        body: newReplyBody.trim(),
        createdBy: userId,
      });
      setNewReplyBody("");
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to post reply.";
      setErrorMessage(message);
    }
  };

  if (loadState === "loading") {
    return <p>Loading discussion…</p>;
  }

  if (loadState === "error") {
    return <p style={{ color: "#b91c1c" }}>{errorMessage}</p>;
  }

  return (
    <div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Discussion</h3>
      {activeThread ? (
        <div>
          <h4 style={{ fontSize: "1rem" }}>{activeThread.title}</h4>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Thread started by {activeThread.created_by}
          </p>

          <div style={{ marginTop: 16 }}>
            {groupedPosts.rootPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <p>{post.body}</p>
                <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {post.created_by}
                </p>
                {(groupedPosts.replyMap.get(post.id) ?? []).map((reply) => (
                  <div
                    key={reply.id}
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderLeft: "3px solid #e5e7eb",
                    }}
                  >
                    <p>{reply.body}</p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {reply.created_by}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <label htmlFor="discussion-reply">Post a reply</label>
            <textarea
              id="discussion-reply"
              value={newReplyBody}
              onChange={(event) => setNewReplyBody(event.target.value)}
              rows={3}
              style={{
                marginTop: 8,
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
            <button
              type="button"
              onClick={handleReplySubmit}
              style={{
                marginTop: 8,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Reply
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>No discussion thread yet. Start one below.</p>
          <div style={{ marginTop: 12 }}>
            <label htmlFor="thread-title">Thread title</label>
            <input
              id="thread-title"
              value={newThreadTitle}
              onChange={(event) => setNewThreadTitle(event.target.value)}
              style={{
                marginTop: 8,
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label htmlFor="thread-body">Starter post</label>
            <textarea
              id="thread-body"
              value={newThreadBody}
              onChange={(event) => setNewThreadBody(event.target.value)}
              rows={3}
              style={{
                marginTop: 8,
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleThreadSubmit}
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Start thread
          </button>
        </div>
      )}
    </div>
  );
}
