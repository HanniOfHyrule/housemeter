import classes from "./MeasurementsForm.module.css";
import { v4 as uuidv4 } from "uuid";
import useInput from "./useInput";
import { Measurement, MeasurementType } from "../../MeasurementInterface";

interface MeasurementsFormProps {
  onAdd: (measurement: Measurement) => void;
}

export default function MeasurementsForm(props: MeasurementsFormProps) {
  const inputValue = useInput((value) => value !== "", "");
  const inputType = useInput(
    (type) => type !== " " && ["Electricity", "Gas", "Water"].includes(type),
    "Electricity"
  ) as { value: MeasurementType } & ReturnType<typeof useInput>;
  const inputDate = useInput(
    (date) => !isNaN(new Date(date).getTime()),
    new Date().toISOString().split("T")[0]
  );

  let formValidity =
    inputValue.isValid && inputType.isValid && inputDate.isValid;

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValidity) {
      return;
    }

    props.onAdd({
      date: new Date(inputDate.value),
      type: inputType.value,
      value: parseFloat(inputValue.value),
      id: uuidv4(),
    });

    inputValue.reset();
  };

  return (
    <form
      className={classes.inputForm}
      onSubmit={submitHandler}
      data-testid="form"
    >
      <div className={classes.formRow}>
        <label htmlFor="Date" className={classes.formLabel}>
          Date
        </label>
        <div className={classes.formInput}>
          <input
            data-testid="inputDate"
            type="date"
            name="date"
            value={inputDate.value}
            className={classes.inputDate}
            onChange={inputDate.valueChangeHandler}
            onBlur={inputDate.inputBlurHandler}
          />
          {inputDate.hasError && (
            <p className={classes.invalid}>Please input a valid date.</p>
          )}
        </div>
      </div>

      <div className={classes.formRow}>
        <label htmlFor="lableType" className={classes.formLabel}>
          Type
        </label>
        <div className={classes.formInput}>
          <select
            data-testid="selectInputType"
            name="measurementsType"
            value={inputType.value}
            className={classes.meterTypeSelect}
            onChange={inputType.valueChangeHandler}
            onBlur={inputType.inputBlurHandler}
          >
            <option value="Electricity">⚡ Electricity</option>
            <option value="Water">💧 Water</option>
            <option value="Gas">🔥 Gas</option>
          </select>
          {inputType.hasError && (
            <p className={classes.invalid}>Please input a valid type.</p>
          )}
        </div>
      </div>

      <div className={classes.formRow}>
        <label htmlFor="value" className={classes.formLabel}>
          Measurement
        </label>
        <div className={classes.formInput}>
          <input
            className={classes.valueInput}
            value={inputValue.value}
            data-testid="inputfieldvalue"
            type="number"
            min={1}
            onChange={inputValue.valueChangeHandler}
            onBlur={inputValue.inputBlurHandler}
          />
          {inputValue.hasError && (
            <p className={classes.invalid}>Please input a valid value.</p>
          )}
        </div>
      </div>

      <div className={classes.submitRow}>
        <button
          type="submit"
          className={classes.submitButton}
          disabled={!formValidity}
        >
          Submit
        </button>
      </div>
    </form>
  );
}
