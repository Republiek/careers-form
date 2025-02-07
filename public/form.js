async function getImageLinks() {
  try {
    const response = await fetch("/api/careers");
    const data = await response.json();

    if (!data.values) {
      document.getElementById("dynamic-form").innerHTML =
        "<p>Could not load questions.</p>";
      return [];
    }

    return data.values.map((item) => ({
      name: item[0],
      imageLink: item[1],
      pageLink: item[2],
    }));
  } catch (error) {
    console.error("Error fetching image links:", error);
    document.getElementById("dynamic-form").innerHTML =
      "<p>Could not load questions.</p>";
    return [];
  }
}

function removeFirstThreeItems(careersData) {
  return careersData.map((item) => item.slice(3));
}

function parseQuestions(questions) {
  return questions.map(([question1, question2, question3]) => ({
    question1: { question: question1, points: 1 },
    question2: { question: question2, points: 2 },
    question3: { question: question3, points: 0 },
  }));
}

function parseCareers(careersHeader, careersData) {
  return careersHeader.reduce((acc, header, i) => {
    if (i % 2 === 0) {
      acc.push({
        name: header,
        correctAnswers: careersData.map((item) => item[i]),
        requiredTrue: careersData.map((item) => item[i + 1] === "TRUE"),
      });
    }
    return acc;
  }, []);
}

async function fetchQuestions() {
  const dynamicForm = document.getElementById("dynamic-form");
  dynamicForm.innerHTML = "<p>Loading questions...</p>"; // Show loading message
  try {
    const response = await fetch("/api/questions");
    const data = await response.json();

    if (!data.values) {
      document.getElementById("dynamic-form").innerHTML =
        "<p>Could not load questions.</p>";
      return;
    }

    const images = await getImageLinks();
    const questions = parseQuestions(data.values.slice(1)); // Exclude the header row
    const careers = parseCareers(
      data.values[0].slice(3),
      removeFirstThreeItems(data.values.slice(1))
    ); // Use the header row and remove first 3 columns

    dynamicForm.innerHTML = ""; // Clear loading message
    generateForm(questions, careers, images);
  } catch (error) {
    document.getElementById("dynamic-form").innerHTML =
      "<p>Error loading questions.</p>";
    console.error("Error fetching data:", error);
  }
}

function generateForm(questions, careers, images) {
  const form = document.createElement("form");
  form.id = "generatedForm";

  let currentPage = 0;
  const questionsPerPage = 5;
  const formData = {};

  function saveFormData() {
    const inputs = form.querySelectorAll("input[type='radio']:checked");
    inputs.forEach((input) => {
      formData[input.name] = input.value;
    });
  }

  function updateProgress() {
    const progressBar = document.getElementById("progress-bar");
    const progress =
      ((currentPage + 1) / Math.ceil(questions.length / questionsPerPage)) *
      100;
    progressBar.style.width = `${progress}%`;
  }

  function validateForm(page) {
    const start = page * questionsPerPage;
    const end = start + questionsPerPage;

    // Select only radio buttons for the current page
    const pageQuestions = questions.slice(start, end);

    // Check if each question has at least one radio button selected
    return pageQuestions.every((_, index) => {
      const questionName = `question${start + index + 1}`;
      return (
        document.querySelector(`input[name="${questionName}"]:checked`) !== null
      );
    });
  }

  function renderPage(page) {
    form.innerHTML = "";
    currentPage = page;
    updateProgress(); // Update progress bar
    const start = page * questionsPerPage;
    const end = start + questionsPerPage;
    const pageQuestions = questions.slice(start, end);

    pageQuestions.forEach((item, index) => {
      const questionWrapper = document.createElement("div");
      questionWrapper.classList.add("question-wrapper");

      const description = document.createElement("p");
      description.textContent = `Question ${start + index + 1}`;

      const createRadio = (question, points) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `question${start + index + 1}`;
        radio.value = points;
        radio.required = true;
        if (formData[radio.name] == radio.value) radio.checked = true;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(question));
        return label;
      };

      questionWrapper.appendChild(description);
      questionWrapper.appendChild(
        createRadio(item.question1.question, item.question1.points)
      );
      questionWrapper.appendChild(
        createRadio(item.question2.question, item.question2.points)
      );
      questionWrapper.appendChild(
        createRadio(item.question3.question, item.question3.points)
      );

      form.appendChild(questionWrapper);
    });

    const navWrapper = document.createElement("div");
    navWrapper.classList.add("nav-wrapper");
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "Please answer all questions before proceeding.";
    errorMessage.style.color = "red";
    errorMessage.style.display = "none"; // Hide the error message initially
    navWrapper.appendChild(errorMessage);
    if (page > 0) {
      const prevButton = document.createElement("button");
      prevButton.type = "button";
      prevButton.textContent = "Previous";
      prevButton.classList.add("nav-btn");
      prevButton.addEventListener("click", () => {
        saveFormData();
        renderPage(page - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      navWrapper.appendChild(prevButton);
    }

    if (end < questions.length) {
      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.textContent = "Next";
      nextButton.classList.add("nav-btn");

      nextButton.addEventListener("click", () => {
        if (!validateForm(page)) {
          errorMessage.style.display = "block"; // Show the error message
          return;
        }
        errorMessage.style.display = "none"; // Hide the error message
        saveFormData();
        renderPage(page + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      navWrapper.appendChild(nextButton);
    } else {
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "SUBMIT";
      submitButton.classList.add("submit-btn");
      navWrapper.appendChild(submitButton);
    }

    form.appendChild(navWrapper);
  }

  renderPage(currentPage);

  // Add form to the dynamic-form container
  document.getElementById("dynamic-form").appendChild(form);

  // Create a section to display results
  const resultsSection = document.getElementById("resultsSection");
  const resultsContainer = document.getElementById("results-container");
  const contactForm = document.getElementById("contact-form");
  resultsSection.style.display = "none"; // Hide results section initially

  // Handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Save the final page's data before submission
    saveFormData();

    form.style.display = "none"; // Hide the form
    document.getElementById("progress-container").style.display = "none"; // Hide the progress bar
    resultsSection.style.display = "block";
    contactForm.style.display = "block";
    resultsContainer.style.display = "grid";
    resultsContainer.style.gap = "2rem";

    if (window.innerWidth >= 600) {
      resultsContainer.style.gridTemplateColumns = "1fr 1fr";
    } else {
      resultsContainer.style.gridTemplateColumns = "1fr";
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 600) {
        resultsContainer.style.gridTemplateColumns = "1fr 1fr";
      } else {
        resultsContainer.style.gridTemplateColumns = "1fr";
      }
    });

    // Use the `formData` object instead of `new FormData(form)`
    const formValues = Object.values(formData);

    const careerResults = careers
      .map((career) => {
        const correctAnswers = career.correctAnswers;
        const requiredTrue = career.requiredTrue;
        let answerCount = 0;
        let careerPoints = 0;

        // Check if any requiredTrue index is false for this career
        const excludeCareer = formValues.some(
          (value, index) =>
            requiredTrue[index] && value !== correctAnswers[index]
        );

        // If the career should be excluded, skip processing it
        if (excludeCareer) return null;

        formValues.forEach((value, index) => {
          if (!!Number(correctAnswers[index])) {
            answerCount++;
          }

          if (value === correctAnswers[index]) {
            careerPoints++;
          }
        });

        let percentage =
          answerCount > 0 ? (careerPoints / answerCount) * 100 : 0;

        const item = images.find((image) => image.name === career.name);
        return {
          name: career.name,
          percentage: percentage.toFixed(2),
          imageLink: item?.imageLink || "",
          pageLink: item?.pageLink || "",
        };
      })
      .filter((result) => result !== null); // Remove null entries from the array

    const topResults = careerResults
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);

    topResults.forEach((career, index) => {
      const careerWrapper = document.createElement("div");
      careerWrapper.classList.add("career-wrapper");

      const careerImage = document.createElement("img");
      const careerElement = document.createElement("h3");
      const careerLink = document.createElement("a");

      careerImage.src = career.imageLink;
      careerImage.alt = career.name;
      careerElement.textContent = `${index + 1}. ${career.name}`;
      careerLink.href = career.pageLink;
      careerLink.textContent = "CLICK HERE FOR FULL CAREER DETAILS";
      careerLink.target = "_blank";
      careerLink.classList.add("submit-btn");
      careerLink.classList.add("career-link");

      careerWrapper.appendChild(careerElement);
      careerWrapper.appendChild(careerImage);
      careerWrapper.appendChild(careerLink);

      resultsContainer.appendChild(careerWrapper);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const payload = Array.from(formData.entries()).map(([key, value]) =>
        value === "on" ? "TRUE" : value
      );

      const date = new Date();
      const formattedDate = `${date.getFullYear()}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
        2,
        "0"
      )}:${String(date.getSeconds()).padStart(2, "0")}`;

      fetch(`/api/write`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [formattedDate, ...payload, JSON.stringify(topResults)],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          if (data.success === "true") {
            alert("We have recieved your response. Thank you!");
            contactForm.reset(); // Reset the form
          } else {
            alert("Something went wrong. Please try again.");
          }
        })
        .catch((error) => {
          alert("Something went wrong. Please try again.");
          console.error("Error:", error);
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("start-button");
  const errorText = document.getElementById("error-text");
  errorText.style.display = "none"; // Hide the error message initially

  startBtn.addEventListener("click", function () {
    document.getElementById("intro").style.display = "none";
    document.getElementById("progress-container").style.display = "block";
    fetchQuestions(); // Fetch questions when start button is clicked
  });

  const fetchForm = document.getElementById("fetch-form");

  fetchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    errorText.style.display = "none";
    const formData = new FormData(fetchForm);
    const email = formData.get("email");

    const url = new URL("/api/user", window.location.origin);
    url.searchParams.append("email", email);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          errorText.style.display = "block";
          fetchForm.reset(); // Reset the form
          return;
        }

        document.getElementById("intro").style.display = "none";

        // Create a section to display results
        const resultsSection = document.getElementById("resultsSection");
        const contactForm = document.getElementById("contact-form");
        resultsSection.style.display = "block";
        contactForm.style.display = "none";
        const resultsContainer = document.getElementById("results-container");

        resultsContainer.style.display = "grid";
        resultsContainer.style.gap = "2rem";

        if (window.innerWidth >= 600) {
          resultsContainer.style.gridTemplateColumns = "1fr 1fr";
        } else {
          resultsContainer.style.gridTemplateColumns = "1fr";
        }

        window.addEventListener("resize", () => {
          if (window.innerWidth >= 600) {
            resultsContainer.style.gridTemplateColumns = "1fr 1fr";
          } else {
            resultsContainer.style.gridTemplateColumns = "1fr";
          }
        });

        const items = JSON.parse(data[3]);

        items.forEach((career, index) => {
          const careerWrapper = document.createElement("div");
          careerWrapper.classList.add("career-wrapper");

          const careerImage = document.createElement("img");
          const careerElement = document.createElement("h3");
          const careerLink = document.createElement("a");

          careerImage.src = career.imageLink;
          careerImage.alt = career.name;
          careerElement.textContent = `${index + 1}. ${career.name}`;
          careerLink.href = career.pageLink;
          careerLink.textContent = "CLICK HERE FOR FULL CAREER DETAILS";
          careerLink.target = "_blank";
          careerLink.classList.add("submit-btn");
          careerLink.classList.add("career-link");

          careerWrapper.appendChild(careerElement);
          careerWrapper.appendChild(careerImage);
          careerWrapper.appendChild(careerLink);

          resultsContainer.appendChild(careerWrapper);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        fetchForm.reset(); // Reset the form
        errorText.style.display = "block";
      });
  });
});
