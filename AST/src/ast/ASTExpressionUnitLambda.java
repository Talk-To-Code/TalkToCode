package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of AST nodes that represents
 * a term of function call (like foo()) 
 * and syntax generation of the respective term.
 * This is available in all C/JAVA/PYTHON.
 */
public class ASTExpressionUnitLambda extends ASTExpressionUnit{
	private static final String NODE_TYPE = "Lambda Function";
	private ASTExpression exp;
	private ArrayList<String> parameters;
	public ASTExpressionUnitLambda(){
		super();
		this.parameters = new ArrayList<String>();
	}
	public void addParameter(String params){
		this.parameters.add(params);
	}
	public void setExpression(ASTExpression e){
		this.exp = e;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	//syntax construction
	public String toSyntax(){
		this.result = "lambda ";
		for(int index = 0;index<this.parameters.size();index++){
			this.result += this.parameters.get(index);
			if(index!=this.parameters.size()-1){
				this.result += ", ";
			}
		}
		this.result += " : " + this.exp.toSyntax();
		if(this.isQuoted) quote();
		return this.result;
	}

}
