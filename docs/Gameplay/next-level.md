---
sidebar_position: 2
title: Getting To The Next Level
---

## Finding The Flag
Every level in a the wargames hides a **flag** — a secret piece of text that proves you’ve solved that level.

The flag is usually in this format:  
```
FLAG{text}
```

Each level hides a different flag.


### Tools
You’re free to use any **CLI** tools you want — the platform doesn’t restrict your environment.  
However, most of the tools you would need to solve a level is pre-downloaded.   

<br/>

## submitting the flag
Once you find a flag, go back to the platform and in the input box for the level you found the flag for, paste the **WHOLE FLAG**, including the "**FLAG**" and the square brackets, and press **“Submit”**.


```
FLAG{this_is_a_flag}
```

If the flag is correct the level will turn green.

> **_NOTE:_**
Always copy the flag exactly as shown (including `FLAG{}` and capitalization).  

<br/>

## entering the next level
When entering the next level, use the flag you found in the previous level as a passwrod. But enter **ONLY** the text btw the square brackets as the passwrod.

Example:
```
FLAG{Pass_For_Next_Lvl}
```

when prompted to enter a password to SSH, enter: `Pass_For_Next_Lvl`

This way the levels stay chained and you cant start a level without finishing the previous one.