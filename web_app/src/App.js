/*
 *  Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 *  WSO2 LLC. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const functionApp = "bal-review-app-1";
  const functionAppUrl = `https://${functionApp}.azurewebsites.net`

  const [data, setData] = useState([]);
  const [image, setImage] = useState({ preview: "", raw: "" });

  const handleChange = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
  };

  const handleSubmission = () => {
    const formData = new FormData();

    formData.append('File', image.raw);

    fetch(
      functionAppUrl + '/reviews/upload?' + new URLSearchParams({
        name: image.raw.name,
      }),
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const fetchData = () => {
    fetch(functionAppUrl + `/dashboard`)
      .then((response) => response.json())
      .then((actualData) => {
        console.log(actualData);
        setData(actualData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div class="container mx-auto px-5 py-10">
      <div class="-m-4 flex flex-wrap">
        {data.map((item, index) => (
          <div class="w-full p-4 md:w-1/2 lg:w-1/4">
            <div class="flex items-center justify-center px-4">
              <div class="max-w-sm overflow-hidden rounded-xl bg-white shadow-md duration-200 hover:scale-105 hover:shadow-xl">
                <img src={item.imageUrl} alt="plant" class="object-cover h-48 w-96" width="190px" height="127px" />
                <div class="p-5">
                  {item.isDog ? <button class="w-full rounded-md bg-indigo-600  py-2 text-indigo-100 hover:bg-indigo-500 hover:shadow-md duration-75">Dog</button> : <button class="w-full rounded-md bg-red-600  py-2 text-indigo-100 hover:bg-indigo-500 hover:shadow-md duration-75">Not a Dog</button>}
                  {item.isDog ? <p class="text-medium mb-5 text-gray-700">{item.description}</p> : <p class="text-medium mb-5 text-gray-700"><br></br></p>}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div class="w-full p-4 md:w-1/2 lg:w-1/4">
          <div class="flex items-center justify-center px-4">
            <div class="max-w-sm overflow-hidden rounded-xl bg-white shadow-md duration-200 hover:scale-105 hover:shadow-xl">
              <label htmlFor="upload-button">
                {image.preview ? (
                  <img src={image.preview} alt="plant" class=".object-fill h-48 w-96" width="190px" height="127px" />
                ) : (
                  <img src="https://i.imgur.com/3g99Q65.png" alt="plant" class=".object-fill h-48 w-96" width="190px" height="127px" />
                )}
              </label>
              <input
                type="file"
                id="upload-button"
                name="file"
                style={{ display: "none" }}
                onChange={handleChange}
              />

              <div class="p-5">
                <button onClick={handleSubmission} class="w-full rounded-md bg-green-600  py-2 text-indigo-100 hover:bg-indigo-500 hover:shadow-md duration-75">Upload</button>
                <p class="text-medium mb-5 text-gray-700"><br></br></p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
