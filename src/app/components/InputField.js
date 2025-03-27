"use client";
import { useState } from "react";
import { phrasesList } from "../utils/utils";

const InputField = () => {
  const [quoteBody, setQuoteBody] = useState({});

  const findDailyQuote = () => {
    let quote = phrasesList[Math.floor(Math.random() * phrasesList.length)];
    setQuoteBody(quote);
    console.log(quote, "quote...");
  };

  return (
    <div>
      <button onClick={findDailyQuote}>Click here</button>

      <div>
        <p>🇬🇧</p>
        <p>{quoteBody.author_en}</p>
        <p>{quoteBody.phrase_en}</p>
        <p>{quoteBody.explanation_en}</p>
      </div>

      <div>
        <p>🇪🇸</p>
        <p>{quoteBody.author_es}</p>
        <p>{quoteBody.phrase_es}</p>
        <p>{quoteBody.explanation_es}</p>
      </div>
    </div>
  );
};

export default InputField;
