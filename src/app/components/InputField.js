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
        <p><span><bold>Author: </bold></span>{quoteBody.author_en}</p>
        <p><span><bold>Phrase: </bold></span>{quoteBody.phrase_en}</p>
        <p><span><bold>Explanation: </bold></span>{quoteBody.explanation_en}</p>
      </div>

      <div>
        <p>🇪🇸</p>
        <p><span><bold>Autor: </bold></span>{quoteBody.author_es}</p>
        <p><span><bold>Frase: </bold></span>{quoteBody.phrase_es}</p>
        <p><span><bold>Explicación: </bold></span>{quoteBody.explanation_es}</p>
      </div>
    </div>
  );
};

export default InputField;
