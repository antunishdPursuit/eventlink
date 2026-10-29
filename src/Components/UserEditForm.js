import ProfileFields from "./ProfileFields";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function UsersNewForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as yyyy-mm-dd
    const [selectedImage, setSelectedImage] = useState('');
    const [previewError, setPreviewError] = useState(false);
    const [user, setUser] = useState({
        profile_picture: "",
        username: "",
        bio: "",
        looking_for_group: false,
        date_created: "",
    });

    useEffect(() => {
        axios
          .get(`${API}/users/${id}`)
          .then((response) => {
            setUser(response.data);
            setSelectedImage(response.data.profile_picture)
          })
          .catch((c) => {
            console.warn("catch", c);
          });
      }, [id]);


  const updateUser = (updatedUser) => {
    axios
      .put(`${API}/users/${id}`, updatedUser)
      .then(
        () => {
          navigate(`/users/${id}`);
        },
        (error) => console.error(error)
      )
      .catch((c) => console.warn("catch", c));
  };

  const handleTextChange = (event) => {
    if(event.target.id === "profile_picture"){
        setPreviewError(false);
        const test = event.target.value.split(".")
        const test1 = test[test.length - 1]
        if (test1 === "jpg" || test1 === "jpeg" || test1 === "png" ){
            // Figured out how to get to the image src but unable to create a deafult picture with there is an invalid src
            // let imageSrc = event.target.offsetParent.children[2].children[1].children[0].src
            setSelectedImage(event.target.value);
        } else setSelectedImage('');
    }
    setUser({ ...user, [event.target.id]: event.target.value });

  };


  const handleCheckboxChange = () => {
    setUser({ ...user, looking_for_group: !user.looking_for_group });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const test = user.profile_picture.split(".")
    const test1 = test[test.length - 1]
    if (
      test1 === "jpg" ||
      test1 === "jpeg" ||
      test1 === "png" 
    ) {
        updateUser(user)
    } else {
        window.confirm(".jpg, .jpeg, and .png are the only supported image types.")
    }
  };

  return <div className="profile-form-card">
    <header className="account-header"><h1>Edit profile</h1></header>
    <form onSubmit={handleSubmit}>
      <ProfileFields user={user} onTextChange={handleTextChange} onGroupChange={handleCheckboxChange}
        selectedImage={selectedImage} previewError={previewError}
        onPreviewError={() => { setSelectedImage(''); setPreviewError(true); }} date={user.date_created?.slice(0, 10) || formattedDate} />
      <div className="profile-form-actions"><Link to="/users" className="btn btn-secondary">Back</Link><button type="submit" className="btn btn-primary profile-submit">Save changes</button></div>
    </form>
  </div>;
}

export default UsersNewForm;
