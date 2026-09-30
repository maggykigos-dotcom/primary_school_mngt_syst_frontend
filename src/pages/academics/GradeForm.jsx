import { useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const GradeForm = () => {

  const [name, setName] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post("/academics/grades/", {
        name,
      });

      alert("Grade created successfully.");

      setName("");

    } catch (error) {

      console.error(error);
      alert("Failed to create grade.");

    }
  };

  return (

    <div className="form-container">

      <h2>Add Grade</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Grade 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button type="submit">
          Create Grade
        </button>

      </form>

    </div>
  );
};

export default GradeForm;