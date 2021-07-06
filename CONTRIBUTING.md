# Commits

Your commits should be

- atomic: each one should have a single purpose
- complete: each one should be able to pass its test cases
- traceable: one should be able to rollback commits and track down changes

Do not be afraid to have frequent commits. As a matter of fact, frequent commits are good!

# Commit Messages

Commit messages are designed to describe what has changed, and why. Ocassionally, you might also explain how.

A commit message comes in two components: subject line and body. The subject line should be imperative and succinct. Thus, it should begin with a verb, such as "change" or "add". A good guide to follow is "this commit will [subject line]". The [subject line] would be the head of your commit message. For instance, "this commit will [add peanut butter and jelly to the sandwich]" The subject line would be "Add peanut butter and jelly to the sandwich". The subject line should be _capitalized_ and do not end it with a period.

The subject line should not exceed 50 characters. If you find yourself needing more characters, you can use the body to further explain the what and why of your commit. If your commits are good, you should not need to explain how, but if you feel that you should, then feel free!

## The seven rules of a great Git commit message

(from https://chris.beams.io/posts/git-commit/)

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Wrap the body at 72 characters
7. Use the body to explain what and why vs. how

## Other useful tips

You can also use bullet points in your body, typically with a hyphen or an asterisk (but please be consistent!) Please a blank line between every bullet point for better readability.

If you are using an issue tracker, put references to them at the bottom. For instance:

```
Resolves: #abc123
See also: #def567, #ghi890
```
