package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of AST nodes that represents
 * a term of function call (like foo()) 
 * and syntax generation of the respective term.
 * This is available in all C/JAVA/PYTHON.
 */
public class ASTExpressionUnitFunctionCall extends ASTExpressionUnit{
	private static final String NODE_TYPE = "Function Call";
	private String functionName;
	private ArrayList<String> paramName;
	private ArrayList<ASTExpression> parameters;
	public ASTExpressionUnitFunctionCall(String name){
		super();
		this.functionName = name;
		this.parameters = new ArrayList<ASTExpression>();
		this.paramName = new ArrayList<String>();
	}
	public void addParameter(ASTExpression exp){
		this.parameters.add(exp);
		this.paramName.add("");
		exp.parent = this;
	}
	public void addParamName(String s){
		this.paramName.set(this.paramName.size()-1, s);
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	//syntax construction
	public String toSyntax(){
		this.result = this.functionName;
		this.result += "(";
		for(int index = 0;index<this.parameters.size();index++){
			if(this.paramName.get(index).compareTo("") != 0) this.result += this.paramName.get(index) + "=";
			this.result += this.parameters.get(index).toSyntax();
			if(index!=this.parameters.size()-1){
				this.result += ", ";
			}
		}
		this.result += ")";
		if(this.isQuoted) quote();
		return this.result;
	}

}
