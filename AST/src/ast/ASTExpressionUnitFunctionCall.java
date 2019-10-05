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
	private ArrayList<ASTExpression> parameters;
	public ASTExpressionUnitFunctionCall(String name){
		super();
		this.functionName = name;
		this.parameters = new ArrayList<ASTExpression>();
	}
	public void addParameter(ASTExpression exp){
		this.parameters.add(exp);
		exp.parent = this;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	//syntax construction
	public String toSyntax(){
		this.result = this.functionName;
		this.result += "(";
		for(int index = 0;index<this.parameters.size();index++){
			this.result += this.parameters.get(index).toSyntax();
			if(index!=this.parameters.size()-1){
				this.result += ",";
			}
		}
		this.result += ")";
		return this.result;
	}

}
