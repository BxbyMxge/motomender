"use client";

import { Input } from "@nextui-org/react";
import { useState } from "react";
import { test } from '../components/GoogleCloud/Gemini'
import { useSession } from 'next-auth/react';

const ChatPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [resultText, setResultText] = useState("");
  const {data: session} = useSession();
  const _email = session?.user?.email;




  const handleEnterPress = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
          console.log("Input value:", inputValue);
    const fetchedResult = await test(inputValue, _email ?? '');
    console.log("Result text:", fetchedResult);
    setResultText(fetchedResult.toString());
    setInputValue("");

    }
    // Call your separate function here to get the result text
    // For demonstration purposes, let's assume you have a function called `fetchResultText`

  };

  return (
    <div>
      <Input
        placeholder="Type something and press Enter..."
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleEnterPress}
      />
        {resultText && <div dangerouslySetInnerHTML={{ __html: resultText }} />}

    </div>
  );
};

export default ChatPage;
